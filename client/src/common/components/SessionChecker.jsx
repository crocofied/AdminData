import Cookies from 'js-cookie';
import { makePostRequest } from '../utils/api';

function SessionChecker() {
    if(!Cookies.get("session_id")) {
        return false;
    }
    makePostRequest("/check_session", {
        session_id: Cookies.get("session_id")
    })
    .then(response => {
        if(response.data.message="Session is valid"){
            return true;
        }
        return false;
    })
    .catch(error => {
        return false;
    })
  return <></>;
}

export default SessionChecker;
