import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    writeBatch,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import './App.css';
import notionLogo from './assets/notion-logo-no-background.png';
import DocsEditor from './components/Docs/DocsEditor';
import Nav from './components/Nav';
import RootLayout from './components/RootLayout';
import Sidebar from './components/Sidebar/Sidebar';
import useArrayOfObjects from './components/utils/custom/useArrayOfObjects';
import convertTimestampsToDate from './components/utils/helpers/convertTimestampsToDate';
import { defaultProperties } from './components/utils/helpers/propertyHelpers';
import { defaultViews } from './components/utils/helpers/viewHelpers';
import { DatabaseProvider } from './context/context';
import { auth, db } from './firebase';

const AppContainer = styled.div`
  display: grid;
  height: 100vh;
  margin: 0 auto;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

const App = () => {
  const [user, setUser] = useState();
  const [userDbRef, setUserDbRef] = useState();

  const isLoaded = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user === null) isLoaded.current = true;
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const addUser = async (userInfo, userDb) => {
    const { email, displayName, uid } = userInfo;
    try {
      await setDoc(doc(db, `users`, uid), { email, name: displayName });
      const batch = writeBatch(db);
      const propertiesCollection = collection(userDb, 'properties');
      const viewsCollection = collection(userDb, 'views');
      defaultViews.forEach((view) => batch.set(doc(viewsCollection, view.id), view));
      defaultProperties.forEach((property) => batch.set(doc(propertiesCollection, property.id), property));
      batch.set(userDb, { id: uuid() });
      await batch.commit();
    } catch (e) { console.error('Error adding document: ', e); }
  };

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const fetchUserDbRef = async () => {
      try {
        const userDocSnap = await getDoc(userDocRef);
        const userDb = doc(userDocRef, 'dbData', 'mainDb');
        if (!userDocSnap.exists()) await addUser(user, userDb);
        setUserDbRef(userDb);
      } catch (e) { console.error(e); }
    };
    fetchUserDbRef();
  }, [user]);

  const [dbItems, setDbItems, removeDbItem, addDbItem] = useArrayOfObjects([]);
  const [views, setViews, removeView, addView] = useArrayOfObjects(defaultViews);
  const [properties, setProperties, removeProperty, addProperty] = useArrayOfObjects(defaultProperties);

  useEffect(() => {
    if (!userDbRef) return;
    const fetchData = async () => {
      const dbItemsRef = collection(userDbRef, 'dbItems');
      const viewsRef = collection(userDbRef, 'views');
      const propsCollection = collection(userDbRef, 'properties');
      try {
        const [dbItemsSnapshot, viewsSnapshot, propsSnapshot] = await Promise.all([
          getDocs(dbItemsRef), getDocs(viewsRef), getDocs(propsCollection),
        ]);
        setDbItems(dbItemsSnapshot.docs.map(d => convertTimestampsToDate(d.data())).sort((a, b) => a.order - b.order));
        setViews(viewsSnapshot.docs.map(d => ({ ...d.data() })));
        setProperties(propsSnapshot.docs.map(d => ({ ...d.data() })));
        isLoaded.current = true;
      } catch (e) { console.log('Error getting documents: ', e); }
    };
    fetchData();
  }, [setDbItems, setViews, setProperties, userDbRef, user]);

  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('docs');

  if (!isLoaded.current || (user && !views.length))
    return (
      <div className="loading">
        <img src={notionLogo} alt="Notion logo" className="loading-logo" />
      </div>
    );

  const renderContent = () => {
    switch (mode) {
      case 'docs':
        return <div style={{ overflow: 'hidden', height: '100%' }}><DocsEditor /></div>;
      case 'tasks':
        return (
          <DatabaseProvider value={{ userDbRef, user, isModalOpen, setIsModalOpen, isLoaded }}>
            <Routes>
              <Route path="/" element={<Navigate to={`/${views[0].id}`} replace />} />
              <Route path="/:viewId" element={
                <RootLayout views={views} setViews={setViews} addView={addView} removeView={removeView}
                  dbItems={dbItems} setDbItems={setDbItems} addDbItem={addDbItem} removeDbItem={removeDbItem}
                  properties={properties} setProperties={setProperties} addProperty={addProperty}
                  removeProperty={removeProperty} sidebarWidth={sidebarWidth} />
              }>
                <Route path=":dbItemId" element={
                  <Sidebar setSidebarWidth={setSidebarWidth} sidebarWidth={sidebarWidth}
                    dbItems={dbItems} setDbItems={setDbItems} removeDbItem={removeDbItem}
                    properties={properties} setProperties={setProperties} addProperty={addProperty}
                    removeProperty={removeProperty} />
                } />
              </Route>
              <Route path="*" element={<Navigate to={`/${views[0].id}`} replace />} />
            </Routes>
          </DatabaseProvider>
        );
      default:
        return null;
    }
  };

  return (
    <BrowserRouter>
      <AppContainer>
        <Nav mode={mode} onModeChange={setMode} />
        <div style={{ overflow: 'hidden', height: '100%' }}>
          {renderContent()}
        </div>
      </AppContainer>
    </BrowserRouter>
  );
};

export default App;
