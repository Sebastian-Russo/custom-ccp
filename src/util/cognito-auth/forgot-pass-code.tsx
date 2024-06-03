
import * as React from "react";

import { Button, Box, Text, Flex } from 'rebass/styled-components';
import { Input, Label } from '@rebass/forms';

interface ForgotPassCodeProps {
    onSubmit: (code: string) => void;
    onBackClick: () => void;
    submit_error?: string;
}

const ForgotPassCode = ( props: ForgotPassCodeProps ) => {

    const [code, setCode] = React.useState<string>('');

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if(event.key === 'Enter'){
			props.onSubmit(code);
		}
	}

    return (
        <Box>
            <Text>An email has been sent with a confirmation code.</Text>
            <br></br>
            <Label>Confirmation Code:</Label>
            <Input
                onChange={(code: React.ChangeEvent<HTMLInputElement>) => setCode(code.target.value)}
                onKeyPress={handleKeyPress}
            />
            <Button
                onClick={() => props.onSubmit(code)}
                mr="6px"
				mt="6px"
            >
                Submit
            </Button>

            <button
                onClick={props.onBackClick}
                style={{color: 'inherit', backgroundColor: 'inherit', border: 'none'}}
            >
                <u>Go Back</u>
            </button>

            {props.submit_error &&
			<Flex flex="1" mt="6px">
				<Text>{props.submit_error}</Text>
			</Flex>}

        </Box>
    );
};

export {
    ForgotPassCode
}
