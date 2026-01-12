import React, { useState } from 'react';
import { createAttribute } from '../../../lib/api';

const AttributeManager = () => {
  const [name, setName] = useState('');
  const [values, setValues] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAttribute({ 
        attribute_name: name, 
        attribute_values: values.split(',').map(v => v.trim()) 
      });
      setMessage('Attribute created successfully!');
      setName('');
      setValues('');
    } catch (error) {
      setMessage('Error creating attribute');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-bold mb-4">Attribute Management</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Attribute Name (e.g. Size, Color)</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Values (comma separated)</label>
          <input 
            type="text" 
            value={values} 
            onChange={(e) => setValues(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Small, Medium, Large"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Attribute
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default AttributeManager;
