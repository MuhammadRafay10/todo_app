import { useState, useEffect } from 'react';
import axios from 'axios';
import "./app.css";

function App() {
  // --- States ---
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);

  // --- Authentication States ---
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoginView, setIsLoginView] = useState(true); // Toggle between Login & Signup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Axios ke liye headers config taake har baar token khud ba khud chala jaye
  const axiosConfig = {
    headers: { Authorization: token }
  };

  // 1. Get Todos (Sirf tab chalega jab token maujood ho)
  const fetchTodos = () => {
    if (!token) return;
    axios.get('http://localhost:5000/todos', axiosConfig)
      .then((response) => {
        setTodos(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Data load nahi ho saka!");
      });
  };

  useEffect(() => {
    fetchTodos();
  }, [token]); // Jab bhi token change ya set hoga, todos load honge

  // 2. Add ya Update Todo
  const handleTodoSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editId) {
      axios.put(`http://localhost:5000/todos/${editId}`, { text: inputText }, axiosConfig)
        .then((response) => {
          const updatedTodos = todos.map(todo => todo._id === editId ? response.data : todo);
          setTodos(updatedTodos);
          setInputText('');
          setEditId(null);
        })
        .catch((error) => console.error("Error updating todo:", error));
    } else {
      axios.post('http://localhost:5000/todos', { text: inputText }, axiosConfig)
        .then((response) => {
          setTodos([...todos, response.data]);
          setInputText('');
        })
        .catch((error) => console.error("Error adding todo:", error));
    }
  };

  // 3. Delete Todo
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/todos/${id}`, axiosConfig)
      .then(() => {
        setTodos(todos.filter(todo => todo._id !== id));
      })
      .catch((error) => console.error("Error deleting todo:", error));
  };

  // 4. User Auth Submit (Login / Signup handles)
// 4. User Auth Submit (Login / Signup handles)
  // 4. User Auth Submit (Login / Signup handles)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    // Sahi tariqe se endpoint chunna
    const endpoint = isLoginView ? 'login' : 'signup';
    
    // YAHAN DEKHEIN: URL bilkul clear 'http://localhost:5000/auth/signup' ya 'login' banna chahiye
    axios.post(`http://localhost:5000/auth/${endpoint}`, { username, password })
      .then((response) => {
        if (isLoginView) {
          // Login Success
          localStorage.setItem("token", response.data.token);
          setToken(response.data.token);
          setUsername('');
          setPassword('');
          setError(null);
        } else {
          // Signup Success
          alert("Account kamyabi se ban gaya hai! Ab aap Login kar sakte hain.");
          setIsLoginView(true); // Signup ke baad Login wale page par le jao
          setPassword('');
        }
      })
      .catch((err) => {
        console.error("Auth Error:", err.response?.data);
        alert(err.response?.data?.error || "Kuch galti hui hai!");
      });
  };

  // 5. Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTodos([]);
  };

  // ==========================================
  //     INTERFACE RENDERING (UI CHOOSE)
  // ==========================================

  // JAB USER LOGGED IN NAHI HAI (No Token) -> Login/Signup Screen dikhao
 // JAB USER LOGGED IN NAHI HAI (No Token) -> Login/Signup Screen dikhao
  if (!token) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>{isLoginView ? "Login to Your Account" : "Create New Account"}</h2>
        {/* Form tag check karein */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'inline-block', textAlign: 'left', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '8px', width: '250px' }} required />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '8px', width: '250px' }} required />
          </div>
          
          {/* Button hamesha type="submit" hona chahiye */}
          <button type="submit" style={{ padding: '10px', width: '100%', cursor: 'pointer', fontSize: '16px' }}>
            {isLoginView ? "Login" : "Sign Up"}
          </button>
          
          <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
            {isLoginView ? "Account nahi hai? " : "Pehle se account hai? "}
            <span onClick={() => { setIsLoginView(!isLoginView); setError(null); }} style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>
              {isLoginView ? "Register karein" : "Login karein"}
            </span>
          </p>
        </form>
      </div>
    );
  }

  // JAB USER LOGGED IN HAI (Token Mojood Hai) -> Asli Todo App dikhao
  return (
    <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <h1>Todo_App 📝</h1>
        <button onClick={handleLogout} style={{ padding: '5px 15px', backgroundColor: '#red', color: 'black', border: '1px solid black', cursor: 'pointer', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
      <br />
      
      <form onSubmit={handleTodoSubmit} style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Write a task..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ padding: '10px', width: '250px', fontSize: '16px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          {editId ? "Update" : "Add Todo"}
        </button>
      </form>

      {error ? (
        <p style={{ color: 'red' }}><strong>{error}</strong></p>
      ) : (
        <div>
          <h3>Your Personal Saved Data:</h3>
          {todos.length === 0 ? (
            <p style={{ color: '#777' }}>No todos found. Try adding your first task!</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {todos.map((todo) => (
                <li key={todo._id} style={{
                  margin: '10px auto', fontSize: '18px', backgroundColor: '#f4f4f4', padding: '10px', width: '380px', borderRadius: '5px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ marginLeft: '10px' }}>✅ {todo.text}</span>
                  <div>
                    <button onClick={() => { setInputText(todo.text); setEditId(todo._id); }} style={{ background: 'none', border: 'none', color: 'blue', fontSize: '16px', cursor: 'pointer', marginRight: '10px' }}>✏️</button>
                    <button onClick={() => handleDelete(todo._id)} style={{ background: 'none', border: 'none', color: 'red', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}>❌</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;