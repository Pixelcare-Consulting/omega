"use client";

import React from "react";

export function CompanyDetailsForm({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <form className="grid grid-cols-2 gap-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-semibold mb-1">Company Name</label>
        <select id="companyName" className="border rounded-md w-full px-3 py-2">
          <option>Select one</option>
        </select>
      </div>
      <div>
        <label htmlFor="companyPhone" className="block text-sm font-semibold mb-1">Company HQ Phone</label>
        <div className="flex gap-2">
          <select className="border rounded-md px-2 py-2">
            <option>🇺🇸</option>
          </select>
          <input id="companyPhone" className="border rounded-md w-full px-3 py-2" placeholder="+1 (201) 555-0123" />
          <input className="border rounded-md w-20 px-2 py-2" placeholder="ext." />
        </div>
      </div>
      <div className="col-span-2">
        <label htmlFor="website" className="block text-sm font-semibold mb-1">Website</label>
        <input id="website" className="border rounded-md w-full px-3 py-2" />
      </div>
      <div>
        <label htmlFor="foundedYear" className="block text-sm font-semibold mb-1">Founded Year</label>
        <input id="foundedYear" className="border rounded-md w-full px-3 py-2" />
      </div>
      <div>
        <label htmlFor="revenueRange" className="block text-sm font-semibold mb-1">Revenue Range (in USD)</label>
        <div className="flex gap-2">
          <select id="revenueRange" className="border rounded-md w-full px-3 py-2">
            <option>Select one</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="employees" className="block text-sm font-semibold mb-1">Employees</label>
        <input id="employees" className="border rounded-md w-full px-3 py-2" />
      </div>
      <div>
        <label htmlFor="locations" className="block text-sm font-semibold mb-1">Number of Locations</label>
        <input id="locations" className="border rounded-md w-full px-3 py-2" />
      </div>
      <div className="col-span-2">
        <label htmlFor="address" className="block text-sm font-semibold mb-1">Full Address</label>
        <textarea id="address" className="border rounded-md w-full px-3 py-2 min-h-[60px]" />
      </div>
    </form>
  );
} 