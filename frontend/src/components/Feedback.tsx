import React, { useState } from 'react';

interface Session {
  id: number;
  mentorName: string;
  skill: string;
  date: string;
  duration: string;
}

interface LeaderboardUser {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  role: 'mentor' | 'mentee';
}

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');

  const pastSessions: Session[] = [
    { id: 1, mentorName: "Jane Smith", skill: "React", date: "2023-12-01", duration: "1 hour" },
    { id: 2, mentorName: "Mike Johnson", skill: "Python", date: "2023-11-28", duration: "45 min" },
  ];

  const leaderboard: LeaderboardUser[] = [
    { id: 1, name: "Sarah Wilson", rating: 4.9, reviews: 156, role: 'mentor' },
    { id: 2, name: "David Chen", rating: 4.8, reviews: 142, role: 'mentor' },
    { id: 3, name: "Emma Davis", rating: 4.7, reviews: 98, role: 'mentee' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Feedback & Ratings</h1>

        {/* Rate Your Mentor/Mentee Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Rate Your Experience</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-4 border rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Write your review here..."
              rows={4}
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Submit Feedback
            </button>
          </div>
        </section>

        {/* Past Sessions Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Past Learning Sessions</h2>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session.id} className="border-b dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{session.skill} with {session.mentorName}</h3>
                <p className="text-gray-600 dark:text-gray-400">{session.date} • {session.duration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Leaderboard</h2>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <div key={user.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.role === 'mentor' ? 'Mentor' : 'Mentee'}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400">★ {user.rating}</p>
                  <p className="text-gray-600 dark:text-gray-400">{user.reviews} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Feedback;
