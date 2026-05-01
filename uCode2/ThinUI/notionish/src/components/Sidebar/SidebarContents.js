import { mdiCheckboxBlankOutline, mdiCheckboxOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { deleteDoc, doc } from 'firebase/firestore';
import { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { DatabaseContext } from '../../context/context';
import { hoverStyle } from '../../context/theme';
import PropertyLabel from '../Properties/Labels/PropertyLabel';
import NameProperty from '../Properties/NameProperty';
import NotesProperty from '../Properties/NotesProperty';
import propertyData, {
    unhoverableTypes,
} from '../utils/helpers/propertyHelpers';
import AddNewPropertySidebar from './AddNewPropertySidebar';

const PropertiesContainer = styled.div`
  padding: clamp(12px, 4vw, 48px) clamp(12px, 4vw, 48px) 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const PropertyRow = styled.div`
  margin: 4px 0;
  width: 100%;
  display: grid;
  grid-template-columns: 140px 1fr;
`;

const TodoName = styled(NameProperty)`
  font-size: 30px;
  font-weight: 700;
  grid-column: 1 / -1;
`;

const StyledPropertyLabel = styled(PropertyLabel)`
  ${hoverStyle};
`;

const DonePropertyLabel = styled(PropertyLabel)`
  cursor: default;
`;

const ClickablePropertyValue = styled.div`
  ${hoverStyle};
  & > div:focus {
    background: rgb(37, 37, 37);
    box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px,
      rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px;
  }
`;

const DoneButton = styled(Icon)`
  cursor: pointer;
  align-self: start;
  margin: 6px 8px 7px;
  color: var(--main-font-color);
`;

const StyledNotes = styled(NotesProperty)`
  height: 100%;
  width: 100%;
  grid-column: 1 / -1;
  margin: 10px 0;
`;

const StyledAddPropButton = styled(AddNewPropertySidebar)`
  margin: 0 0 10px 5px;
`;

const SidebarContents = ({
  dbItemId,
  dbItems,
  setDbItems,
  removeDbItem,
  properties,
  setProperties,
  addProperty,
  removeProperty,
  handleClickClose,
}) => {
  const { userDbRef } = useContext(DatabaseContext);

  const selectedDbItem = useMemo(() => {
    return dbItems.find((item) => item.id === dbItemId);
  }, [dbItemId, dbItems]);

  const handleDeleteTodoAndCloseSidebar = async () => {
    handleClickClose();
    removeDbItem(dbItemId);

    if (!userDbRef) return;

    try {
      await deleteDoc(doc(userDbRef, 'dbItems', dbItemId));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <PropertiesContainer id="properties">
      <TodoName
        selectedProperty={{ name: 'name' }}
        data={selectedDbItem}
        setDbItems={setDbItems}
        autoFocus
      />
      {properties.map((property) => {
        const { name, type } = property;
        const { icon, getComponent } = propertyData[type];

        const component = getComponent({
          selectedProperty: property,
          data: selectedDbItem,
          setDbItems: setDbItems,
          setProperties: setProperties,
        });

        return (
          <PropertyRow key={name}>
            <StyledPropertyLabel
              icon={icon}
              selectedProperty={property}
              properties={properties}
              setProperties={setProperties}
              removeProperty={removeProperty}
              setDbItems={setDbItems}
            />
            {unhoverableTypes.includes(type) ? (
              <>{component}</>
            ) : (
              <ClickablePropertyValue>{component}</ClickablePropertyValue>
            )}
          </PropertyRow>
        );
      })}
      <PropertyRow>
        <DonePropertyLabel
          icon={mdiCheckboxOutline}
          selectedProperty={{ name: 'Done?' }}
          disabled={true}
        />
        <DoneButton
          path={mdiCheckboxBlankOutline}
          size={0.85}
          onClick={handleDeleteTodoAndCloseSidebar}
        />
      </PropertyRow>
      <StyledAddPropButton
        properties={properties}
        addProperty={addProperty}
        setDbItems={setDbItems}
      />
      <hr />
      <StyledNotes
        selectedProperty={{ name: 'notes' }}
        data={selectedDbItem}
        setDbItems={setDbItems}
        placeholder={'Add notes here...'}
      />
    </PropertiesContainer>
  );
};

export default SidebarContents;
