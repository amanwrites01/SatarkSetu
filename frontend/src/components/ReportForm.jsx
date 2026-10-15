import { useState } from 'react';
import { Loader2, Send, EyeOff } from 'lucide-react';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.jsx';

function Field({ field, value, error, onChange }) {
  const id = `f-${field.name}`;
  const common = {
    id,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-err` : undefined,
  };

  let control;
  if (field.type === 'select') {
    control = (
      <select {...common}>
        <option value="">Choose…</option>
        {field.options.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...common} rows={field.rows ?? 6} placeholder={field.placeholder} maxLength={field.max ?? 5000} />;
  } else {
    control = (
      <input
        {...common}
        type={field.type === 'number' ? 'number' : 'text'}
        inputMode={field.type === 'number' ? 'numeric' : undefined}
        min={field.type === 'number' ? 0 : undefined}
        placeholder={field.placeholder}
        autoComplete="off"
      />
    );
  }

  return (
    <label className={`field ${field.wide ? 'field-wide' : ''}`} htmlFor={id}>
      <span>{field.label}{field.required && <b aria-hidden> *</b>}</span>
      {control}
      {error && <small id={`${id}-err`} className="field-error">{error}</small>}
    </label>
  );
}

export default function ReportForm({ type, initialIdentifier = '', onSuccess }) {
  const category = CATEGORIES[type];
  const [values, setValues] = useState(() => (category.identifier ? { identifier: initialIdentifier } : {}));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });

  const fields = [
    ...(category.identifier ? [{ name: 'identifier', required: true, wide: true, ...category.identifier }] : []),
    ...category.fields,
    type === 'story'
      ? { name: 'description', label: 'What happened?', type: 'textarea', required: true, wide: true, rows: 8,
          placeholder: 'Walk us through it: how they contacted you, what they said, what made you suspicious (or not)…' }
      : { name: 'description', label: 'What happened?', type: 'textarea', required: true, wide: true,
          placeholder: 'Describe the message or call and what they asked you to do…' },
    type === 'story'
      ? { name: 'lesson', label: 'One tip for others (optional)', type: 'textarea', wide: true, rows: 2, max: 600,
          placeholder: 'If I could warn one person, I\'d say…' }
      : { name: 'city', label: 'City (optional)', placeholder: 'Mumbai' },
  ];

  const update = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading' });
    try {
      const { report } = await api.create({ ...values, type });
      setStatus({ state: 'idle' });
      setValues(category.identifier ? { identifier: '' } : {});
      onSuccess?.(report);
    } catch (err) {
      setErrors(err.details ?? {});
      setStatus({ state: 'error', message: err.message });
    }
  };

  return (
    <form className="report-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        {fields.map((f) => (
          <Field key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={update} />
        ))}
      </div>

      <div className="form-foot">
        <p className="anon-note">
          <EyeOff size={15} /> No account, no name. You'll appear as a random alias, and your IP address is never stored.
        </p>
        <button className="btn btn-primary btn-lg" disabled={status.state === 'loading'} style={{ '--accent': category.color }}>
          {status.state === 'loading' ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          {type === 'story' ? 'Share anonymously' : 'Submit report'}
        </button>
      </div>
      {status.state === 'error' && <p className="form-error" role="alert">{status.message}</p>}
    </form>
  );
}
