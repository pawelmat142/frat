"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const AppModule_1 = require("./AppModule");
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule_1.AppModule);
    app.enableCors({
        origin: process.env.NODE_ENV === 'production' ? false : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('JobHigh API')
        .setDescription('High-Altitude Work Professional Network Platform API')
        .setVersion('1.0')
        .addTag('dictionaries')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3100;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map