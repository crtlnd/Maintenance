import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

const InvitationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Adjust based on your auth context
  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // If user is not authenticated, redirect to signup with token
    if (!isAuthenticated) {
      navigate(`/auth?mode=signup&inviteToken=${token}`);
      return;
    }

    // If user is authenticated, validate and show invitation details
    validateInvitation();
  }, [token, isAuthenticated, navigate]);

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/team/invitation/${token}/validate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
        }
      });

      if (!response.ok) {
        throw new Error('Invalid or expired invitation');
      }

      const data = await response.json();
      setInvitationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/invitation/${token}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      // Redirect to dashboard with success message
      navigate('/dashboard?joined=true');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const declineInvitation = () => {
    // Optionally call API to mark as declined
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-green-500 text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600">
            You've been invited to join an organization
          </p>
        </div>

        {invitationData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Organization Details:</h2>
            <p className="text-gray-700">
              <strong>Name:</strong> {invitationData.organization.name}
            </p>
            <p className="text-gray-700">
              <strong>Type:</strong> {invitationData.organization.type}
            </p>
            <p className="text-gray-700">
              <strong>Role:</strong> {invitationData.invitation.role}
            </p>
            <p className="text-gray-700">
              <strong>Invited by:</strong> {invitationData.invitedBy.firstName} {invitationData.invitedBy.lastName}
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={acceptInvitation}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium"
          >
            Accept Invitation
          </button>
          <button
            onClick={declineInvitation}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationHandler;
