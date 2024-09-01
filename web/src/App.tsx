import { Flex, Heading } from '@radix-ui/themes';
import './App.css';
import CanvasBoard from 'components/CanvasBoard';

function App() {
  return (
    <Flex direction={'column'} align={'center'} style={{ height: '100vh' }}>
      <Heading as='h1' size={'7'} style={{ padding: '4rem' }}>
        MNNIST Ineferance
      </Heading>
      <CanvasBoard />
    </Flex>
  );
}

export default App;
