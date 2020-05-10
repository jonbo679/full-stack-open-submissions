import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const Button = ({ text, action }) => {
  return (
    <button onClick={action}>{text}</button>
  )
}

const Statistic = ({ text, value }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{value}</td>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad, handleIncrementGood, handleIncrementNeutral, handleIncrementBad }) => {

  return (
    <>


      <h2>statistics</h2>
      {(good || bad || neutral) ? (
        <table>
          <tbody>
            <Statistic text="good" value={good} />
            <Statistic text="neutral" value={neutral} />
            <Statistic text="bad" value={bad} />
            <Statistic text="all" value={bad + good + neutral} />
            <Statistic text="average" value={(good - bad) / (good + neutral + bad)} />
            <Statistic text="positive" value={`${good / (good + neutral + bad)} %`} />
          </tbody>
        </table>
      ) : (
          <p>No feedback given</p>
        )}
    </>
  )
}

const App = () => {
  // save clicks of each button to own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  const handleIncrementGood = () => {
    setGood(good + 1);
  }
  const handleIncrementNeutral = () => {
    setNeutral(neutral + 1);
  }
  const handleIncrementBad = () => {
    setBad(bad + 1);
  }

  return (
    <div>
      <h2>give feedback</h2>
      <Button text="good" action={handleIncrementGood} />
      <Button text="neutral" action={handleIncrementNeutral} />
      <Button text="bad" action={handleIncrementBad} />
      <Statistics
        good={good}
        neutral={neutral}
        bad={bad}
        handleIncrementGood={handleIncrementGood}
        handleIncrementNeutral={handleIncrementNeutral}
        handleIncrementBad={handleIncrementBad}></Statistics>
    </div>
  )
}

ReactDOM.render(<App />,
  document.getElementById('root')
)