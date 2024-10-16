interface TestPostProps {
    modeUrl: string;
}

function TestPost(props: TestPostProps) {

    const sendTestPost = async () => {
        const fetchUrl: string = props.modeUrl + '/create-account';
        fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: "TESTTEST@example.com",
                password: "securePassword123",
                firstName: "John",
                lastName: "Doe"
            }),
        })
            .then(response => response.text())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

  return (
    <>
        <div>TestPost</div>
        <button onClick={sendTestPost}>Send Test</button>
    </>
  )
}

export default TestPost