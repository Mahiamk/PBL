import React, { useState } from 'react';
import { Camera, X, Loader } from 'lucide-react';
import { updateProfile } from '../../lib/api';

const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  user, 
  t, 
  profileImage, 
  onImageUpload,
  onProfileUpdate
}) => {
  const [name, setName] = useState(user?.name || '');
  
  // Effect to update local state when user prop changes (e.g. initial load)
  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onImageUpload(e); // Preview logic handling parent state if needed
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (file) {
        formData.append('photo', file);
      }
      
      const updatedUser = await updateProfile(formData);
      onProfileUpdate(updatedUser); // Update parent state with new user data
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t.editProfile}</h3>
              <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-2">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-secondary transition-colors shadow-sm">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">{t.uploadPhoto}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    readOnly
                    className="mt-1 block w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm cursor-not-allowed" 
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin mr-2"/> : null}
              {t.saveChanges}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={loading}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
