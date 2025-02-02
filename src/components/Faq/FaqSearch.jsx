import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { Button } from 'reactstrap';
import { searchFAQs, logUnansweredQuestion } from './api';

function FaqSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [logging, setLogging] = useState(false);

  const fetchSuggestions = debounce(async query => {
    try {
      const response = await searchFAQs(query);
      setSuggestions(response.data);
      setNotFound(response.data.length === 0);
    } catch (error) {
      console.error('Error fetching FAQ suggestions:', error);
    }
  }, 300);

  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedFAQ(null);

    if (query.length >= 1) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
      setNotFound(false);
    }
  };

  const handleSelectFAQ = faq => {
    setSelectedFAQ(faq);
    setSearchQuery('');
    setSuggestions([]);
    setNotFound(false);
  };

  const handleLogUnanswered = async () => {
    if (!searchQuery.trim()) return;

    setLogging(true);
    try {
      const response = await logUnansweredQuestion(searchQuery);
      alert(response.data.message || 'Your question has been recorded.');
    } catch (error) {
      console.error('Error logging unanswered question:', error);
      alert('Failed to log question. It may already exist.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div>
      <h2>Frequently Asked Questions</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search FAQs"
      />

      {selectedFAQ ? (
        <div>
          <h4>{selectedFAQ.question}</h4>
          <p>{selectedFAQ.answer}</p>
        </div>
      ) : suggestions.length > 0 ? (
        <ul>
          {suggestions.map(faq => (
            <li
              key={faq._id}
              onClick={() => handleSelectFAQ(faq)}
              style={{
                padding: '10px',
                margin: '5px 0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: '#f9f9f9',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            >
              {faq.question}
            </li>
          ))}
        </ul>
      ) : notFound ? (
        <div>
          <p>No results found.</p>
          <Button color="primary" onClick={handleLogUnanswered} disabled={logging}>
            {logging ? 'Logging...' : 'Log this question and notify Owner'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default FaqSearch;
