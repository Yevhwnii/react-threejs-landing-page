import React, { Suspense, useRef, useEffect } from 'react';
import './App.scss';

import { Canvas, useFrame } from 'react-three-fiber';
import { Html, useGLTFLoader } from 'drei';
//Components
import Header from './components/header';
import { Section } from './components/section';

// page state
import state from './components/state';

// intersection observer
import { useInView } from 'react-intersection-observer';

const Model = ({ path }) => {
  // loads model from public folder
  const gltf = useGLTFLoader(path, true);
  return <primitive object={gltf.scene} dispose={null} />;
};

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[0, 10, 0]} intensity={1.5} />
      <spotLight intensity={1} position={[1000, 0, 0]} />
    </>
  );
};
/*
group is r3f component which allows to group elements on the scene, position props are x,y,z
Section is about scrolling between sections (taken from r3f code snippets)
useFrame`s callback is executed on every frame I suppose
*/
const HTMLContent = ({
  domContent,
  children,
  modelPath,
  positionY,
  bgColor,
}) => {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.y += 0.01));
  const [refItem, inView] = useInView({ threshold: 0 });

  useEffect(() => {
    inView && (document.body.style.background = bgColor);
  }, [inView]);
  return (
    <Section factor={1.5} offset={1}>
      <group position={[0, positionY, 0]}>
        <mesh ref={ref} position={[0, -35, 0]}>
          <Model path={modelPath} />
        </mesh>
        <Html portal={domContent} fullscreen>
          <div className='container' ref={refItem}>
            {children}
          </div>
        </Html>
      </group>
    </Section>
  );
};

/*
Suspense waits for code to load meanwhile displaying loading spinner
*/
export default function App() {
  const domContent = useRef();
  const scrollArea = useRef();
  const onScroll = (e) => (state.top.current = e.target.scrollTop);

  useEffect(() => void onScroll({ target: scrollArea.current }), []);
  return (
    <>
      <Header />
      <Canvas colorManagement camera={{ position: [0, 0, 120], fov: 70 }}>
        <Lights />
        <Suspense fallback={null}>
          <HTMLContent
            domContent={domContent}
            modelPath='/armchairYellow.gltf'
            bgColor='#f15946'
            positionY={250}>
            <h1 className='title'>Look at this chair, wow!</h1>
          </HTMLContent>
          <HTMLContent
            domContent={domContent}
            modelPath='/armchairGreen.gltf'
            bgColor='#571ec1'
            positionY={0}>
            <h1 className='title'>And this one look very nice!</h1>
          </HTMLContent>
          <HTMLContent
            domContent={domContent}
            modelPath='/armchairGray.gltf'
            bgColor='#636567'
            positionY={-250}>
            <h1 className='title'>Grey one</h1>
          </HTMLContent>
        </Suspense>
      </Canvas>
      <div className='scrollArea' ref={scrollArea} onScroll={onScroll}>
        <div style={{ position: 'sticky', top: 0 }} ref={domContent}></div>
        <div style={{ height: `${state.sections * 100}vh` }}></div>
      </div>
    </>
  );
}
