import dayjs from 'dayjs';
import { useState } from 'react';
import './App.css';

function App() {
  const [contributionsPerDay, setContributionsPerDay] = useState(null);
  const [token, setToken] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('year').format('YYYY-MM-DD'));

  const [user, setUser] = useState(null);

  const getContributionsPerDay = async () => {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({query: `
        query { 
          user: user(login: "${user}") {
            email
            createdAt
            contributionsCollection(from: "${dayjs(startDate).toISOString()}", to: "${dayjs(endDate).toISOString()}") {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    weekday
                    date 
                    contributionCount 
                    color
                  }
                }
                months  {
                  name
                    year
                    firstDay 
                  totalWeeks 
                  
                }
              }
            }
          }
      }`}),
    });

    const json = await response.json();
    const contributions = json.data.user.contributionsCollection.contributionCalendar.totalContributions;
    const daysBetween = dayjs(endDate).diff(dayjs(startDate), 'days');

    return contributions / daysBetween;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <div className='flex items-center gap-3'>
      <div className='flex flex-col gap-1'>
        <a target="_blank" href="https://github.com/settings/tokens/new" rel="noreferrer">Create new token</a>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder='github token' />
      </div>
        <input className='mt-6' type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder='github user' />
      </div>
      <div className='flex items-center gap-3'>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <button onClick={() => {
        getContributionsPerDay().then((data) => {
          setContributionsPerDay(data);
        });
      }}>Get Average Commits Per Day</button>
      {contributionsPerDay && <p>A total of {parseFloat(contributionsPerDay).toFixed(2)} commits per day!</p>}
      </div>
  );
}

export default App;
