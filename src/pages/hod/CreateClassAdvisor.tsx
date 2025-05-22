import React from 'react';

const CreateClassAdvisor = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Class Advisor</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select department</option>
              <option value="cse">Computer Science</option>
              <option value="ece">Electronics</option>
              <option value="mech">Mechanical</option>
            </select>
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              id="class"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select class</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Class Advisor
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassAdvisor;