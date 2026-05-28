import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/ContactSection.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ContactSection = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.validation.name_required', 'Name is required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.email_required', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.email_invalid', 'Please enter a valid email');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.validation.subject_required', 'Subject is required');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.validation.message_required', 'Message is required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t(
        'contact.validation.message_short',
        'Message must be at least 10 characters'
      );
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          data.detail ||
            data.message ||
            t('contact.alert.failed', 'Something went wrong. Please try again.')
        );
        return;
      }

      alert(
        data.message ||
          t(
            'contact.alert.success',
            'Thank you! Your message has been sent successfully. We will get back to you soon.'
          )
      );

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);

      alert(
        t(
          'contact.alert.error',
          'Could not send message. Please try again later.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section-wrapper">
      <div className="contact-container-main">
        <div className="contact-header-main">
          <div className="contact-icon-main">✉️</div>

          <h2 className="section-title">
            {t('contact.title', 'Contact Us')}
          </h2>

          <p className="section-subtitle">
            {t('contact.subtitle', "We'd love to hear from you")}
          </p>
        </div>

        <div className="contact-card-main">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  {t('contact.form.name', 'Name')}
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t(
                    'contact.placeholder.name',
                    'Enter your name'
                  )}
                  className={errors.name ? 'error' : ''}
                />

                {errors.name && (
                  <span className="error-message">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  {t('contact.form.email', 'Email')}
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t(
                    'contact.placeholder.email',
                    'Enter your email'
                  )}
                  className={errors.email ? 'error' : ''}
                />

                {errors.email && (
                  <span className="error-message">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                {t('contact.form.subject', 'Subject')}
              </label>

              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t(
                  'contact.placeholder.subject',
                  'Enter subject'
                )}
                className={errors.subject ? 'error' : ''}
              />

              {errors.subject && (
                <span className="error-message">
                  {errors.subject}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                {t('contact.form.message', 'Message')}
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t(
                  'contact.placeholder.message',
                  'Write your message...'
                )}
                rows="6"
                className={errors.message ? 'error' : ''}
              />

              {errors.message && (
                <span className="error-message">
                  {errors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="contact-btn-main"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('contact.sending', 'Sending...')
                : t('contact.send', 'Send Message')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;