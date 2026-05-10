/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { WorkerRepo } from './WorkerRepo';
import { UserI } from '@shared/interfaces/UserI';
import { WorkerSearchSortOptions, WorkerAvailabilityOptions, WorkerSearchResponse, WorkerStatuses, PROFILES_INITIAL_SEARCH_LIMIT, WorkerLocationOptions, WorkerFormRangesOptions, WorkerSearchRequest, DEFAULT_SEARCH_DISTANCE_M, DefaultWorkerSearchSortOption } from '@shared/interfaces/WorkerI';
import { SelectQueryBuilder } from 'typeorm';
import { WorkerEntity } from 'employee/model/WorkerEntity';
import { SearchUtil } from 'global/utils/SearchUtil';
import { Position } from '@shared/interfaces/MapsInterfaces';

@Injectable()
export class SearchWorkersService {

    private readonly logger = new Logger(this.constructor.name);
    private static readonly SEARCH_SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{16,128}$/;
    constructor(
        private readonly workerRepo: WorkerRepo,
    ) { }

    async searchWorkers(filters: WorkerSearchRequest, user?: UserI, viewerLocation?: Position, searchSessionId?: string): Promise<WorkerSearchResponse> {
        const normalizedFilters = this.normalizeFilters(filters);
        const normalizedViewerLocation = this.normalizeViewerLocation(viewerLocation);

        // Step 1: Build base query for filtering (without eagerly loading relations to avoid row multiplication)
        const baseQueryBuilder = this.workerRepo.getQueryBuilder()
            .leftJoin('profile.availabilityDateRanges', 'ranges');

        let hasFilter = false;

        this.addBasicFilters(baseQueryBuilder, normalizedFilters, hasFilter);
        this.addDateRangeFilter(baseQueryBuilder, normalizedFilters, hasFilter);
        this.addPositionFilter(baseQueryBuilder, normalizedFilters, hasFilter);

        const count: number = await this.getCount(baseQueryBuilder);

        if (!count) {
            return { profiles: [], count };
        }

        // Step 3: Get paginated profile IDs (distinct, with sorting)
        // Using subquery approach to avoid DISTINCT + ORDER BY column mismatch
        const idsQueryBuilder = baseQueryBuilder.clone()
            .select('profile.worker_id', 'id')
            .groupBy('profile.worker_id');

        if (user) {
            this.addMutualFriendsSelect(idsQueryBuilder, user.uid);
        }
        this.addSortingForIds(idsQueryBuilder, normalizedFilters, normalizedViewerLocation, user);
        this.addPagination(idsQueryBuilder, normalizedFilters);

        const idsResult = await idsQueryBuilder.getRawMany();
        const profileIds = idsResult.map(row => row.id);
        const mutualFriendsMap = user ? this.buildMutualFriendsMap(idsResult) : {};
        const normalizedSearchSessionId = this.normalizeSearchSessionId(searchSessionId);

        await this.trackSearchAppearances(profileIds, normalizedSearchSessionId);

        // Step 4: Load full profiles with relations using the IDs
        const resultsQueryBuilder = this.workerRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges')
            .whereInIds(profileIds);

        this.addSortingById(resultsQueryBuilder, profileIds);

        const results = await resultsQueryBuilder.getMany();

        const profilesWithMutualFriends = results.map(profile => ({
            ...profile,
            mutualFriendsUids: mutualFriendsMap[profile.workerId] || []
        }))

        return {
            profiles: profilesWithMutualFriends,
            count,
        };
    }

    private addBasicFilters(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchRequest, hasFilter: boolean) {
        const certificates = SearchUtil.parseArray(filters.certificates);
        const categories = SearchUtil.parseArray(filters.categories);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);
        // Base condition - only ACTIVE profiles
        baseQueryBuilder.where('profile.status = :status', { status: WorkerStatuses.ACTIVE });

        if (communicationLanguages?.length) {
            baseQueryBuilder.andWhere('profile.communication_languages @> :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (certificates?.length) {
            baseQueryBuilder.andWhere('profile.certificates @> :certificates', { certificates });
            hasFilter = true;
        }
        if (categories?.length) {
            baseQueryBuilder.andWhere('profile.categories @> :categories', { categories });
            hasFilter = true;
        }
    }

    private addDateRangeFilter(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchRequest, hasFilter: boolean) {
        // Date range filter - use already joined ranges
        // filters.startDate and endDate are strings in YYYY-MM-DD format
        if (filters.startDate && filters.endDate) {
            baseQueryBuilder.andWhere(`(
                profile.availability_option = '${WorkerAvailabilityOptions.ANYTIME}'
                OR (
                    profile.ranges_option = '${WorkerFormRangesOptions.AVAILABLE_ON}'
                    AND ranges.date_range @> daterange(:startDate, :endDate, '[]')
                )
                OR (
                    profile.ranges_option = '${WorkerFormRangesOptions.NOT_AVAILABLE_ON}'
                    AND NOT EXISTS (
                        SELECT 1 FROM jh_workers_date_ranges r2
                        WHERE r2.worker_id = profile.worker_id
                        AND r2.date_range && daterange(:startDate, :endDate, '[]')
                    )
                )
                OR (
                    profile.availability_option = '${WorkerAvailabilityOptions.FROM_DATE}'
                    AND profile.start_date <= :startDate::date
                )
            )`, {
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            hasFilter = true;
        } else if (filters.startDate) {
            // Only startDate provided - compare with worker's start_date only
            baseQueryBuilder.andWhere(`(
                profile.availability_option = '${WorkerAvailabilityOptions.ANYTIME}'
                OR profile.start_date IS NULL
                OR profile.start_date <= :startDate::date
            )`, {
                startDate: filters.startDate
            });
            hasFilter = true;
        }
    }

    /** Always compute mutual friends UIDs for each profile in the result set */
    private addMutualFriendsSelect(idsQueryBuilder: SelectQueryBuilder<WorkerEntity>, currentUserUid?: string) {
        const mutualSubquery = `(
                SELECT COALESCE(array_agg(mutual.uid), ARRAY[]::text[]) FROM (
                    SELECT CASE WHEN f1.requester_uid = :currentUserUid THEN f1.addressee_uid ELSE f1.requester_uid END AS uid
                    FROM jh_friendships f1
                    WHERE (f1.requester_uid = :currentUserUid OR f1.addressee_uid = :currentUserUid)
                    AND f1.status = 'ACCEPTED'
                    INTERSECT
                    SELECT CASE WHEN f2.requester_uid = profile.uid THEN f2.addressee_uid ELSE f2.requester_uid END AS uid
                    FROM jh_friendships f2
                    WHERE (f2.requester_uid = profile.uid OR f2.addressee_uid = profile.uid)
                    AND f2.status = 'ACCEPTED'
                ) mutual
            )`;
        idsQueryBuilder
            .addGroupBy('profile.uid')
            .addSelect(mutualSubquery, 'mutual_friends_uids')
            .addSelect(`array_length(${mutualSubquery}, 1)`, 'mutual_friends_count')
            .setParameter('currentUserUid', currentUserUid);
    }

    private buildMutualFriendsMap(idsResult: { id: number; mutual_friends_uids: string | string[] }[]): Record<number, string[]> {
        const map: Record<number, string[]> = {};
        for (const row of idsResult) {
            // PostgreSQL may return text[] as a string '{uid1,uid2}' or as parsed array
            const uids = Array.isArray(row.mutual_friends_uids)
                ? row.mutual_friends_uids
                : this.parsePostgresArray(row.mutual_friends_uids);
            if (uids.length > 0) {
                map[row.id] = uids;
            }
        }
        return map;
    }

    private parsePostgresArray(value: string | null): string[] {
        if (!value || value === '{}') return [];
        return value.replace(/^\{|\}$/g, '').split(',');
    }

    private addSortingForIds(
        idsQueryBuilder: SelectQueryBuilder<WorkerEntity>,
        filters: WorkerSearchRequest,
        viewerLocation?: Position,
        user?: UserI,
    ) {
        const sortBy = filters.sortBy || DefaultWorkerSearchSortOption;
        switch (sortBy) {
            case WorkerSearchSortOptions.MUTUAL_FRIENDS:
                if (user) {
                    idsQueryBuilder.addOrderBy('mutual_friends_count', 'DESC', 'NULLS LAST');
                }
                break;

            case WorkerSearchSortOptions.START_FROM_ASC:
                idsQueryBuilder
                    .addSelect('MIN(profile.start_date)', 'sort_start_date')
                    .addOrderBy('sort_start_date', SearchUtil.ASC, 'NULLS LAST');
                break;

            case WorkerSearchSortOptions.START_FROM_DESC:
                idsQueryBuilder
                    .addSelect('MIN(profile.start_date)', 'sort_start_date')
                    .addOrderBy('sort_start_date', SearchUtil.DESC, 'NULLS FIRST');
                break;

            case WorkerSearchSortOptions.CREATED_AT_DESC:
                idsQueryBuilder
                    .addSelect('MAX(profile.created_at)', 'sort_created_at')
                    .addOrderBy('sort_created_at', SearchUtil.DESC);
                break;
            case WorkerSearchSortOptions.CREATED_AT_ASC:
                idsQueryBuilder
                    .addSelect('MIN(profile.created_at)', 'sort_created_at')
                    .addOrderBy('sort_created_at', SearchUtil.ASC);
                break;

            case WorkerSearchSortOptions.DISTANCE_ASC:
                if (viewerLocation?.lat != null && viewerLocation?.lng != null) {
                    idsQueryBuilder
                        .addSelect(`MIN(CASE
                            WHEN profile.location_option = :distanceLocationOption AND profile.point IS NOT NULL THEN ST_Distance(
                                profile.point,
                                ST_SetSRID(ST_MakePoint(:sortLng, :sortLat), 4326)::geography
                            )
                            ELSE NULL
                        END)`, 'sort_distance_m')
                        .setParameters({
                            distanceLocationOption: WorkerLocationOptions.POSITION,
                            sortLat: viewerLocation.lat,
                            sortLng: viewerLocation.lng,
                        })
                        .addOrderBy('sort_distance_m', SearchUtil.ASC, 'NULLS LAST');
                }
                break;

        }

        // add views count sorting
        idsQueryBuilder
            .addOrderBy('profile.unique_views_count', SearchUtil.DESC, 'NULLS LAST');
    }

    private addStartFromSorting(idsQueryBuilder: SelectQueryBuilder<WorkerEntity>) {
        idsQueryBuilder
            .addSelect('MIN(lower(ranges.date_range))', 'earliest_date')
            .addOrderBy('earliest_date', SearchUtil.ASC, 'NULLS LAST');
    }

    /** Preserve order from paginated IDs query using CASE expression */
    private addSortingById(queryBuilder: SelectQueryBuilder<WorkerEntity>, profileIds: number[]) {
        if (profileIds.length === 0) return;

        // Preserve original order using CASE WHEN
        const orderCase = profileIds
            .map((id, index) => `WHEN profile.worker_id = ${id} THEN ${index}`)
            .join(' ');

        queryBuilder.orderBy(`CASE ${orderCase} END`, 'ASC');
    }


    private getCount(queryBuilder: SelectQueryBuilder<WorkerEntity>): Promise<number> {
        const countQuery = queryBuilder.clone()
            .select('profile.worker_id')
            .distinct(true)
            .orderBy();
        return countQuery.getCount();
    }

    private addPagination(queryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchRequest) {
        const skip = Number(filters.skip) || 0;
        const limit = Number(filters.limit) || PROFILES_INITIAL_SEARCH_LIMIT;
        queryBuilder.offset(skip).limit(limit);
    }

    private addPositionFilter(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchRequest, hasFilter: boolean) {
        // Skip location filter if "worldwide" is selected
        if (filters.locationCountry === 'worldwide') {
            return;
        }

        const hasCoordinates = filters.lat != null && filters.lng != null;

        if (!filters.locationCountry) {
            throw new Error('locationCountry is required for position filter');
        }

        const conditions: string[] = [];
        const params: Record<string, any> = {};

        // ALL_EUROPE workers always match any location filter
        conditions.push(`profile.location_option = '${WorkerLocationOptions.ALL_EUROPE}'`);

        // SELECTED_COUNTRIES - narrow to matching country when country filter is provided, otherwise match all
        conditions.push(`(
                profile.location_option = '${WorkerLocationOptions.SELECTED_COUNTRIES}'
                AND profile.location_countries @> ARRAY[:locationCountry]::text[]
            )`);
        params.locationCountry = filters.locationCountry!.toLowerCase();

        if (hasCoordinates) {
            const radiusMeters = filters.positionRadiusKm
                ? filters.positionRadiusKm * 1000
                : DEFAULT_SEARCH_DISTANCE_M;

            conditions.push(`(
                profile.location_option = '${WorkerLocationOptions.POSITION}'
                AND ST_DWithin(
                    profile.point,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusMeters
                )
            )`);
            params.lng = filters.lng;
            params.lat = filters.lat;
            params.radiusMeters = radiusMeters;
        } else {
            // No coordinates - match POSITION profiles by country stored in location_countries
            conditions.push(`(
                profile.location_option = '${WorkerLocationOptions.POSITION}'
                AND profile.location_countries @> ARRAY[:locationCountry]::text[]
            )`);
        }

        baseQueryBuilder.andWhere(`(${conditions.join('\n            OR ')})`, params);
        hasFilter = true;
    }

    private normalizeFilters(filters: WorkerSearchRequest): WorkerSearchRequest {
        return {
            ...filters,
            lat: this.parseNumber(filters.lat),
            lng: this.parseNumber(filters.lng),
            positionRadiusKm: this.parseNumber(filters.positionRadiusKm),
            skip: this.parseNumber(filters.skip) ?? 0,
            limit: this.parseNumber(filters.limit) ?? PROFILES_INITIAL_SEARCH_LIMIT,
        };
    }

    private normalizeViewerLocation(viewerLocation?: Position): Position | null {
        if (!viewerLocation) {
            return null;
        }
        return {
            lat: this.parseNumber(viewerLocation?.lat),
            lng: this.parseNumber(viewerLocation?.lng),
        };
    }

    private parseNumber(value: unknown): number | undefined {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined;
        }

        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        }

        return undefined;
    }

    private normalizeSearchSessionId(searchSessionId?: string): string | null {
        if (!searchSessionId) {
            return null;
        }

        const normalized = searchSessionId.trim();
        if (!normalized) {
            return null;
        }

        return SearchWorkersService.SEARCH_SESSION_ID_REGEX.test(normalized)
            ? normalized
            : null;
    }

    private async trackSearchAppearances(profileIds: number[], searchSessionId: string | null): Promise<void> {
        if (!profileIds.length) {
            this.logger.warn('No profile IDs to track search appearances for.');
            return;
        }
        if (!searchSessionId) {
            this.logger.warn('Invalid or missing searchSessionId. Skipping search appearances tracking.');
            return;
        }

        try {
            await this.workerRepo.incrementSearchAppearancesCountDedup(profileIds, searchSessionId);
            this.logger.log(`Processed deduplicated searchAppearancesCount for ${profileIds.length} workers (session ${searchSessionId})`);
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);

            if (reason.includes('jh_worker_search_appearances') && reason.includes('does not exist')) {
                this.logger.warn('Search appearances dedup table is missing. Search appearances tracking disabled until service restart.');
            } else {
                this.logger.warn(`Failed deduplicated searchAppearancesCount for ${profileIds.length} workers: ${reason}`);
            }
        }
    }

}