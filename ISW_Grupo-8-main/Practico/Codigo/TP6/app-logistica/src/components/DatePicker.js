import React from 'react';
import { Field } from 'formik';
import { format } from 'date-fns';

const DatePicker = ({ name, onChange }) => {
  return (
    <Field name={name}>
      {({ field }) => (
        <input
          type="date"
          {...field}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
};
export default DatePicker; 