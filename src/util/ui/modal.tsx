
import * as React from "react";
import styled from "styled-components";


/**
 * Modal component with option for a single "OK" button, or Yes/No buttons.
 * Container has class name "modal-container". Buttons have class name "modal-button".
 * props:
 *  message: string - Message to be displayed by the modal.
 *  visible: boolean - Toggle display of modal.
 *  updateParentState: Function - Callback to update parent component. recieves a boolean
 *                                indicating user response.  Needs to reset the visible prop
 *                                to hide the modal again.
 *  has_option?: boolean - If true modal displays Yes/No button. If false only OK button.
 *                         Defaults to false if not provided.
 */

interface ContainerProps {
    visible: boolean
}

// Container for the modal
const StyledContainer = styled.div<ContainerProps>`
    display: ${props => props.visible ? "block" : "none"};
    background-color: white;
    border: 1px solid lightslategray;
    border-radius: 2px;
    box-shadow: 2px 2px 2px lightslategray;

    height: 80px;
    width: 400px;
    margin: 10px;
    text-align: center;

    position: sticky;
    bottom: 80%;
    z-index: 1;
`;

// Container for the buttons within the modal.
const ButtonContainer = styled.div`
    position: absolute;
    bottom: 0;
    width: 100%;

    display: flex;
    justify-content: center;
`;

// The buttons
const ModalButton = styled.button`
    display: inline-block;
    margin: 5px;
`;

interface ModalProps {
    message: string,
    has_option?: boolean,
    updateParentState: Function,
    visible: boolean
}

// The modal
const Modal = (props: ModalProps) => {

    const resolveFunction = React.useRef<Function>( () => {} );

    // Return a promise to be resolved by button event listener
    const handleUserResponse = () => {
        return new Promise<boolean>( (resolve) => {
            resolveFunction.current = resolve;
        });
    };

    // When modal is set to visible, wait for user input, then return it to parent
    React.useEffect( () => {
        if (props.visible) {
            handleUserResponse().then( (user_response: boolean) => {
                props.updateParentState(user_response);
            });
        }
    }, [props.visible]);

    // Event listener for buttons
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget.name === "Yes")
            resolveFunction.current(true);
        else if (event.currentTarget.name === "No")
            resolveFunction.current(false);
    };

    return (
        <StyledContainer className="modal-container" visible={props.visible}>
            {props.message}
            <ButtonContainer>
                <ModalButton className="modal-button" name="Yes" onClick={handleButtonClick}>
                    {props.has_option ? "Yes" : "OK"}
                </ModalButton>
                {props.has_option ?
                    (<ModalButton className="modal-button" name="No" onClick={handleButtonClick}>No</ModalButton>) : null
                }
            </ButtonContainer>
        </StyledContainer>
    );
};

export { Modal };
