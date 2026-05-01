import { useEffect, useMemo } from 'react';
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import DatabaseContent from './DatabaseTypes/DatabaseContent';
import { applyFilters } from './Views/Filter/filterHelpers';
import sortFunction from './Views/Sort/sortHelpers';
import ViewsNav from './Views/ViewsNav';

const MainContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: 0 max(8px, calc((100vw - 800px) / 2));
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 0 6px;
  }
`;

const RootLayout = ({
  views,
  setViews,
  removeView,
  addView,
  properties,
  setProperties,
  addProperty,
  removeProperty,
  dbItems,
  setDbItems,
  addDbItem,
  removeDbItem,
  sidebarWidth,
}) => {
  const { viewId } = useParams();
  const match = useMatch(`/${viewId}`);

  const navigate = useNavigate();
  useEffect(() => {
    if (!views.find((item) => item.id === viewId))
      navigate(`/${views[0].id}`);
  }, [viewId, views, navigate]);

  const selectedView = useMemo(() => {
    return views.find((item) => item.id === viewId) ?? views[0];
  }, [viewId, views]);

  const editedDbItems = useMemo(() => {
    let updatedDbItems = dbItems;
    if (selectedView.filter?.length)
      updatedDbItems = applyFilters(updatedDbItems, selectedView.filter);

    if (selectedView.sort?.length)
      updatedDbItems = sortFunction(updatedDbItems, selectedView.sort);

    return updatedDbItems;
  }, [selectedView, dbItems]);

  const contentWidth = useMemo(() => {
    return !match ? `calc(100%  - ${sidebarWidth}px)` : '100%';
  }, [sidebarWidth, match]);

  return (
    <>
      <MainContentContainer
        style={{ minWidth: contentWidth, width: contentWidth }}
      >
        <ViewsNav
          selectedView={selectedView}
          views={views}
          setViews={setViews}
          removeView={removeView}
          addView={addView}
          properties={properties}
        />
        <DatabaseContent
          editedDbItems={editedDbItems}
          selectedView={selectedView}
          views={views}
          properties={properties}
          setProperties={setProperties}
          addProperty={addProperty}
          removeProperty={removeProperty}
          dbItems={dbItems}
          setDbItems={setDbItems}
          addDbItem={addDbItem}
          removeDbItem={removeDbItem}
        />
        <Outlet />
      </MainContentContainer>
    </>
  );
};

export default RootLayout;
