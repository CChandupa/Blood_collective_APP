const districts = [
  'Colombo', 'Gampaha', 'Kalutara', // Western
  'Kandy', 'Matale', 'Nuwara Eliya', // Central
  'Galle', 'Matara', 'Hambantota', // Southern
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', // Northern
  'Batticaloa', 'Ampara', 'Trincomalee', // Eastern
  'Kurunegala', 'Puttalam', // North Western
  'Anuradhapura', 'Polonnaruwa', // North Central
  'Badulla', 'Moneragala', // Uva
  'Ratnapura', 'Kegalle' // Sabaragamuwa
].sort();

async function seed() {
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    
    try {
      const res = await fetch('http://localhost:3000/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          city: district,
          postal_code: '00000',
          district: district
        })
      });
      
      const data = await res.json();
      if (data.success) {
        console.log(`Added: ${district}`);
      } else {
        console.error(`Failed to add ${district}:`, data.error);
      }
    } catch (err) {
      console.error(`Error adding ${district}:`, err.message);
    }
  }
}

seed();
