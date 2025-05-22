import React from 'react';

const CreateFaculty = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Faculty</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter faculty name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select department</option>
              <option value="cs">Computer Science</option>
              <option value="it">Information Technology</option>
              <option value="ec">Electronics & Communication</option>
              <option value="ee">Electrical Engineering</option>
              <option value="me">Mechanical Engineering</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
              Subjects
            </label>
            <select
              id="subjects"
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="programming">Programming</option>
              <option value="networks">Computer Networks</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple subjects</p>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Faculty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFaculty;