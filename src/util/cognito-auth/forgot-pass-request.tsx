
import * as React from "react";

import { Button, Box, Flex, Text } from 'rebass/styled-components';
import { Input, Label } from '@rebass/forms';

interface PassChangeRequestProps {
    onSubmit: (username: string) => Promise<void>;
    onBackClick: () => void;
    submit_error?: string;
}

const ForgotPassRequest = ( props: PassChangeRequestProps ) => {

    const [username, setUsername] = React.useState<string>('');

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if(event.key === 'Enter') {
			props.onSubmit(username);
		}
	}

    return (
        <Box>
            <Label>User Name:</Label>
            <Input
                onChange={(un: React.ChangeEvent<HTMLInputElement>) => setUsername(un.target.value) }
                onKeyPress={handleKeyPress}
            />
            <Button
                onClick={() => props.onSubmit(username)}
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
    ForgotPassRequest
};