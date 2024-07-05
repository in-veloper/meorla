import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const DateTimeEditor = forwardRef((props, ref) => {
    const [value, setValue] = useState('');
    const [initialValue, setInitialValue] = useState('');

    useEffect(() => {
        if (props.value) {
            const initialDate = new Date(props.value);
            setInitialValue(props.value);
            if (!isNaN(initialDate.getTime())) {
                const formattedDate = new Intl.DateTimeFormat('kr', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false
                }).format(initialDate).replace(/\//g, '-').replace(/, /g, 'T').slice(0, 16);
                setValue(formattedDate);
                setInitialValue(props.value);
            }
        }
    }, [props.value]);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            if(value === '') {
                return initialValue;
            }
            
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
            }
            return '';
        }
    }));

    return (
        <input 
            type="datetime-local" 
            className="ag-input" 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            style={{ width: '100%' }}
        />
    );
});

export default DateTimeEditor;
