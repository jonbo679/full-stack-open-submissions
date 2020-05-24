import React, { useState, useEffect } from 'react';
import personService from './services/persons';

const Filter = ({ filter, setFilter }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={event => setFilter(event.target.value)}></input>
    </div>
  )
}

const PersonForm = ({ newName, setNewName, newNumber, setNewNumber, handleAddPerson }) => {
  return (
    <form onSubmit={handleAddPerson}>
      <div>
        name: <input value={newName} onChange={event => setNewName(event.target.value)} />
        <div>number: <input value={newNumber} onChange={event => setNewNumber(event.target.value)} /></div>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, handleDeletePerson }) => {
  return (
    persons.map(person => <Person key={person.name} person={person} handleDeletePerson={handleDeletePerson} />)
  )
}

const Person = ({ person, handleDeletePerson }) => {
  return (
    <div key={person.name}>{person.name} {person.number} <button onClick={() => handleDeletePerson(person.id)}>delete</button></div>
  )
}

const InfoNotification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="info">
      {message}
    </div>
  )
}

const ErrorNotification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [infoMessage, setInfoMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    personService.getAll()
      .then(persons => {
        setPersons(persons);
      })
  }, []);

  const filteredPersons = persons.filter(person => {
    return person.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  })

  const handleAddPerson = (event) => {
    event.preventDefault();
    const existingPerson = persons.find(person => person.name === newName);
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService.update({ ...existingPerson, number: newNumber })
          .then(changedPerson => {
            setPersons(persons.map(person => person.id !== changedPerson.id ? person : changedPerson));
            showInfoMessage(`Updated number for ${newName}`);
          })
          .catch(showErrorMessage(`Information of ${newName} has already been removed from the server`));
      }
    } else {
      const newPerson = { name: newName, number: newNumber }
      personService.create(newPerson)
        .then(person => {
          setPersons(persons.concat(person));
          showInfoMessage(`Added ${newName}`);

        })
    }
    setNewName('');
    setNewNumber('');
  }

  const handleDeletePerson = (id) => {
    personService.deletePerson(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id));
      })
  }

  const showInfoMessage = message => {
    setInfoMessage(message);
    setTimeout(() => {
      setInfoMessage(null);
    }, 5000)
  }

  const showErrorMessage = message => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <InfoNotification message={infoMessage} />
      <ErrorNotification message={errorMessage} />
      <Filter
        filter={filter}
        setFilter={setFilter} />

      <h2>Add a new</h2>
      <PersonForm
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
        handleAddPerson={handleAddPerson}
      />

      <h2>Numbers</h2>
      <Persons persons={filteredPersons} handleDeletePerson={handleDeletePerson} />

    </div>
  )
}

export default App