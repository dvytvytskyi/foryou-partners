
async function testAmoToken() {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjI3YmE2YzBkNTQ4NGZkNWRmMDBiMDBiNzIyNGQ5NDg0NGY4ZmQxMDQ5Y2ZlZTM2MDJlMzE2NTg1ZDAwZWI1MDg3NzI3YjAyNWI4MGRjZWFhIn0.eyJhdWQiOiIzNmY2MWIzZC0zNDlkLTQ4ZTgtODUwYS0wOGVkNjYwMjFlYzYiLCJqdGkiOiIyN2JhNmMwZDU0ODRmZDVkZjAwYjAwYjcyMjRkOTQ4NDRmOGZkMTA0OWNmZWUzNjAyZTMxNjU4NWQwMGViNTA4NzcyN2IwMjViODBkY2VhYSIsImlhdCI6MTc3NzI5NDQ0MywibmJmIjoxNzc3Mjk0NDQzLCJleHAiOjE4MTEzNzYwMDAsInN1YiI6IjEwNjg4Njk0IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTIwMTk0LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiODFiODc5YWEtZmY0NS00Y2RkLWI5YTUtOWVmYjZmYzZmNzdhIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.ZRhvxCI1VJXdF6GQi25SdBAukWCcO0Wy0NX07A6R4nmDc13tIRn4eckMchO-siub5D5A04XrwMbbj8v9-GuHvQvADKlbMzkQXl4gRSneozNwnmtY96o85nRizQXdztFbdzcCuWHNs2Tq4Nqn0o9dtXuqYyeEMnddUuigcN_Erjsmmg0buyemwdnM2q7ahb3SCcoe2l9frxyoBmRF0CSOy0s4_D3PulE-HQWrZOyU-lSmpMY7wG4EY3i9X9eoQrMgWZP4mWJgQP01L8OH22F75VvoVxZ_QpS2VqgRtRtdQSWghKY-WexFBxGWp05Xvtamm-bzNoNoz5GZ-qt5xshd3A';
  const apiDomain = 'reforyou.amocrm.ru';

  console.log(`Testing amoCRM token on ${apiDomain}...`);
  try {
    const response = await fetch(`https://${apiDomain}/api/v4/leads/pipelines`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Found pipelines:', data._embedded?.pipelines?.length || 0);
      if (data._embedded?.pipelines) {
          data._embedded.pipelines.forEach(p => console.log(`- ${p.name} (id: ${p.id})`));
      }
    } else {
      const text = await response.text();
      console.log('Error body:', text);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testAmoToken();
