import type React from "react";

interface ButtonText {
    title: String
}

const AuthButtons: React.FC<ButtonText> = ({ title }) => {

    return(

        <button>{title}</button>
        
    )
}

export default AuthButtons