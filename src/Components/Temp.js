import React, {useEffect} from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router';

const Temp = () => {
    const { isLogin, isChecked } = useSelector(
        (state) => state.users
    );
    let navigate = useNavigate();
    
    const goLoginPage = () => {
        navigate("/", {replace: false});
    }

    useEffect(() => {
        if (isChecked && !isLogin) {
            goLoginPage();
        }

    }, [isLogin, isChecked]);
    
    return (
        <div>
            <p>hello</p>
        </div>
    )
}

export default Temp;