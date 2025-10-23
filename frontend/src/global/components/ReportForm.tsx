import React, { useState } from 'react';
import Textarea from './controls/Textarea';
import Input from './controls/Input';
import Button from './controls/Button';
import { BtnModes, BtnSizes } from '../interface/controls.interface';
import { useTranslation } from 'react-i18next';

const ReportForm: React.FC = () => {
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
    setLoading(true);
    // TODO: send to backend or email
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
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
    <form className="flex flex-col gap-4 card p-6 my-8 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-2">{t('report.title')}</h2>
      <Textarea
        name="message"
        label={t('report.feedbackLabel')}
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        fullWidth
        rows={6}
        error={error ? { message: error } : null}
      />
      <Input
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
