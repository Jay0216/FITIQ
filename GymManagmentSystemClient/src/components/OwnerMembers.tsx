import React, { useState } from 'react';
import './OwnerMembers.css';

const OwnerMembers: React.FC = () => {

  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', plan: 'Premium' },
    { id: 2, name: 'Jane Smith', plan: 'Basic' },
  ]);

  const removeMember = (id: number) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <div className="owner-members">
      <h2>Members Management</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Plan</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.plan}</td>
              <td>
                <button onClick={() => removeMember(member.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerMembers;