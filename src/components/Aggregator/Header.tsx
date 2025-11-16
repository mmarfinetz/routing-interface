import { Heading, Image } from '@chakra-ui/react';
import styled from 'styled-components';

const Wrapper = styled.div`
	position: absolute;
	z-index: 100;
	display: flex;
	justify-content: space-between;
	width: calc(100% - 32px);
`;

const Name = styled(Heading)`
	font-size: 26px;
`;

const Header = ({ children }) => {
	return (
		<Wrapper>
			<Name
				fontSize={['26px', '26px', '32px', '32px']}
				display="flex"
				alignItems="center"
				cursor="pointer"
			>
				<Image
					src="https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg"
					w={['28px', '28px', '36px', '36px']}
					h={['28px', '28px', '36px', '36px']}
					mr="8px"
					alt="Base Router logo"
				/>
				Base Router
			</Name>
			{children}
		</Wrapper>
	);
};

export default Header;
