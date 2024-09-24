import axios from 'axios';
import Cookies from 'js-cookie';

function SessionChecker() {
    if(!Cookies.get("session_id")) {
        return false;
    }
    axios.post(`http://server:5000/check_session`, {
        session_id: Cookies.get("session_id")
    }, {
        headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if(response.data.message="Session is valid"){
            return true;
        }
        return false;
    })
    .catch(error => {
        return false;
    }, {})
  return <></>;
}

export default SessionChecker;
