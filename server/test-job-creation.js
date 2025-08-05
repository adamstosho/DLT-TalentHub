const axios = require('axios');

// Test job creation with different payloads
async function testJobCreation() {
  const baseURL = 'http://localhost:5000/api';
  
  // Test payload 1: Minimal required fields
  const minimalPayload = {
    title: "Test Job",
    description: "This is a test job description with enough characters to meet the minimum requirement.",
    company: {
      name: "Test Company"
    },
    type: "full-time",
    category: "Development",
    location: {
      type: "remote"
    },
    salary: {
      min: 50000,
      max: 80000,
      currency: "USD"
    }
  };

  // Test payload 2: Full payload
  const fullPayload = {
    title: "Senior Blockchain Developer",
    description: "We are looking for a senior blockchain developer with experience in Ethereum, Solidity, and smart contract development. The ideal candidate will have at least 3 years of experience in blockchain development and a strong understanding of DeFi protocols.",
    company: {
      name: "DLT Africa",
      logo: "",
      website: "https://dlt-africa.com"
    },
    type: "full-time",
    category: "Development",
    skills: ["Solidity", "Ethereum", "Smart Contracts", "DeFi"],
    requirements: ["3+ years experience", "Bachelor's degree", "Strong problem-solving skills"],
    location: {
      type: "remote",
      city: "",
      country: "",
      address: ""
    },
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD"
    },
    isUrgent: false,
    isFeatured: false
  };

  try {
    console.log('Testing job creation...');
    console.log('Payload:', JSON.stringify(fullPayload, null, 2));
    
    const response = await axios.post(`${baseURL}/jobs`, fullPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a valid token
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`- ${err.field}: ${err.message} (value: ${err.value})`);
      });
    }
  }
}

// Run the test
testJobCreation(); 