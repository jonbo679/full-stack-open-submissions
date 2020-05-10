import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const App = (props) => {
  const [selected, setSelected] = useState(0);
  const [votes, setVotes] = useState(new Array(6).fill(0))


  let indexMostVotes = 0;
  if (votes) {
    votes.forEach((vote, index) => {
      if (vote > votes[indexMostVotes]) {
        indexMostVotes = index;
      }
    })
  }

  const handleRandomAnecdote = () => {
    console.log(Math.floor(Math.random() * 6));
    setSelected(Math.floor(Math.random() * 6));
  }

  const handleVote = () => {
    let newVotes = [...votes];
    newVotes[selected] += 1;
    setVotes(newVotes);
  }

  return (
    <div>
      <div>
        <h2>Anecdote of the day</h2>
        <p>{props.anecdotes[selected]}<br />
          has {votes[selected]} votes</p>
      </div>
      <button onClick={handleVote} >vote</button>
      <button onClick={handleRandomAnecdote} >next anecdote</button>
      <div>
        <h2>Anecdote with most votes</h2>
        <p>{props.anecdotes[indexMostVotes]}<br />
          has {votes[indexMostVotes]} votes</p>
      </div>
    </div>
  )
}

const anecdotes = [
  'If it hurts, do it more often',
  'Adding manpower to a late software project makes it later!',
  'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  'Premature optimization is the root of all evil.',
  'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
]

ReactDOM.render(
  <App anecdotes={anecdotes} />,
  document.getElementById('root')
)