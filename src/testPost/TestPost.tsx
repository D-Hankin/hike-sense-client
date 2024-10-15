interface TestPostProps {
    modeUrl: string;
}

function TestPost(props: TestPostProps) {

    const sendTestPost = async () => {
        const fetchUrl: string = props.modeUrl + 'users/test-post';
        fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: "user@example.com",
                password: "securePassword123",
                firstName: "John",
                lastName: "Doe",
                hikes: [], 
                friends: [] 
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