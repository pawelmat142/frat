import React, { useState } from 'react';
import Button from './controls/Button';
import { BtnModes, BtnSizes } from '../interface/controls.interface';
import { useTranslation } from 'react-i18next';
import { FeedbackService } from 'global/services/FeedbackService';
import FloatingTextarea from './controls/FloatingTextarea';
import FloatingInput from './controls/FloatingInput';

interface ReportFormProps {
  title?: string;
}

const ReportForm: React.FC<ReportFormProps> = ({ title }) => {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!message.trim()) {
      setError(t('report.errorRequired'));
      return;
    }

    try {
        setLoading(true);
        await FeedbackService.createFeedback({
            message: message.trim(),
            contactEmail: contact.trim(),
        });
        setSubmitted(true);
    } catch (error) {
        setError(t('report.errorSubmitting'));
    } finally {
        setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card p-6 my-8 text-center">
        <h3 className="font-bold text-lg mb-2">{t('report.thankYouTitle')}</h3>
        <p>{t('report.thankYouMsg')}</p>
      </div>
    );
  }

  return (
  <form className="flex flex-col gap-4 mt-10 mb-8 w-full md:max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="secondary-text">{title ?? t('report.title')}</h2>
      <FloatingTextarea
        name="message"
        label={t('report.feedbackLabel')}
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        fullWidth
        rows={6}
        error={error ? { message: error } : null}
      />
      <FloatingInput
        name="contact"
        label={t('report.contactLabel')}
        value={contact}
        onChange={e => setContact(e.target.value)}
        fullWidth
        type="text"
      />
      <Button
        type="submit"
        mode={BtnModes.PRIMARY}
        size={BtnSizes.LARGE}
        fullWidth
        disabled={loading}
        className="mt-2"
      >
        {loading ? t('report.sending') : t('report.send')}
      </Button>
    </form>
  );
};

export default ReportForm;
