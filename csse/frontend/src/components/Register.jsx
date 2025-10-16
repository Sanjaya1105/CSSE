import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: 'patient',
    name: '',
    email: '',
    password: '',
    // Patient fields
    address: '',
    idCardNumber: '',
    age: '',
    // Doctor fields
    nic: '',
    specialization: '',
    registerNumber: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Prepare data based on user type
      let submitData = {
        userType: formData.userType,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      if (formData.userType === 'patient') {
        submitData = {
          ...submitData,
          address: formData.address,
          idCardNumber: formData.idCardNumber,
          age: parseInt(formData.age)
        };
      } else if (formData.userType === 'doctor') {
        submitData = {
          ...submitData,
          nic: formData.nic,
          specialization: formData.specialization,
          registerNumber: formData.registerNumber
        };
      } else if (formData.userType === 'staff') {
        submitData = {
          ...submitData,
          nic: formData.nic,
          registerNumber: formData.registerNumber
        };
      }

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Registration successful!', type: 'success' });
        // Reset form
        setFormData({
          userType: 'patient',
          name: '',
          email: '',
          password: '',
          address: '',
          idCardNumber: '',
          age: '',
          nic: '',
          specialization: '',
          registerNumber: ''
        });
      } else {
        setMessage({ text: data.message || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
  <img src="/bb.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl p-0 w-full max-w-3xl flex overflow-hidden z-10 border border-blue-200">
        {/* Left Side: Image & Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-blue-400 p-8 w-1/2">
          <img src="/log.jpg" alt="Hospital" className="w-32 h-32 object-cover rounded-2xl shadow-lg mb-6 border-4 border-blue-200" />
          <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">Create Account</h2>
          <p className="text-blue-100 text-center mb-4">Register to access hospital services and manage your health.</p>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <span className="text-white font-semibold">Hospital Management System</span>
          </div>
        </div>
        {/* Right Side: Register Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-2">Register</h2>
          <p className="text-center text-blue-500 mb-8">Fill in your details below</p>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-400'
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-2">Register as</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff/Nurse</option>
              </select>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-blue-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* Patient Specific Fields */}
            {formData.userType === 'patient' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your address"
                    rows="2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">ID Card Number</label>
                  <input
                    type="text"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter ID card number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter age"
                    min="0"
                    required
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {formData.userType === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter NIC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Register Number</label>
                  <input
                    type="text"
                    name="registerNumber"
                    value={formData.registerNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter register number"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">Select specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
              </div>
            )}

            {/* Staff/Nurse Specific Fields */}
            {formData.userType === 'staff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter NIC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Register Number</label>
                  <input
                    type="text"
                    name="registerNumber"
                    value={formData.registerNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter register number"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-700 hover:text-blue-900 font-semibold underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

