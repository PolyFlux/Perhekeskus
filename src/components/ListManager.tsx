import React, { useState, useEffect } from 'react';
import { Plus, Check, X, ShoppingCart, Package, MapPin, Heart, RefreshCw, Trash2 } from 'lucide-react';

interface ListItem {
  id: number;
  text: string;
  completed: boolean;
  quantity?: string;
}

interface CustomList {
  id: number;
  name: string;
  type: 'shopping' | 'packing' | 'custom';
  icon: string;
  color: string;
  bgColor: string;
  items: ListItem[];
  createdAt: Date;
}

interface ListManagerProps {
  sharedShoppingList: ListItem[];
  setSharedShoppingList: (items: ListItem[]) => void;
}

const ListManager: React.FC<ListManagerProps> = ({ sharedShoppingList, setSharedShoppingList }) => {
  const [lists, setLists] = useState<CustomList[]>([
    {
      id: 1,
      name: 'Viikon ruokaostokset',
      type: 'shopping',
      icon: 'shopping',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      createdAt: new Date(),
      items: sharedShoppingList
    },
    {
      id: 2,
      name: 'Lomamatkan pakkaus',
      type: 'packing',
      icon: 'package',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      createdAt: new Date(),
      items: [
        { id: 5, text: 'Passi', completed: true },
        { id: 6, text: 'Aurinkovoide', completed: false },
        { id: 7, text: 'Uimapuku', completed: false },
        { id: 8, text: 'Kamera', completed: false },
      ]
    },
    {
      id: 3,
      name: 'Syntymäpäiväjuhlan ideat',
      type: 'custom',
      icon: 'heart',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      createdAt: new Date(),
      items: [
        { id: 9, text: 'Varaa juhlatila', completed: true },
        { id: 10, text: 'Tilaa kakku', completed: false },
        { id: 11, text: 'Lähetä kutsut', completed: false },
        { id: 12, text: 'Osta koristeet', completed: false },
      ]
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListType, setNewListType] = useState<'shopping' | 'packing' | 'custom'>('custom');
  const [newItem, setNewItem] = useState<{ [key: number]: string }>({});
  const [newItemQuantity, setNewItemQuantity] = useState<{ [key: number]: string }>({});

  // Synkronoi jaettu ostoslista pääostoslistan kanssa
  useEffect(() => {
    setLists(prevLists => 
      prevLists.map(list => 
        list.id === 1 && list.type === 'shopping' 
          ? { ...list, items: sharedShoppingList }
          : list
      )
    );
  }, [sharedShoppingList]);

  const listTypeOptions = [
    { value: 'shopping', label: 'Ostoslista', icon: 'shopping', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'packing', label: 'Pakkauslista', icon: 'package', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'custom', label: 'Mukautettu lista', icon: 'heart', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping': return ShoppingCart;
      case 'package': return Package;
      case 'location': return MapPin;
      default: return Heart;
    }
  };

  const createNewList = () => {
    if (!newListName.trim()) return;

    const typeOption = listTypeOptions.find(opt => opt.value === newListType);
    if (!typeOption) return;

    const newList: CustomList = {
      id: Date.now(),
      name: newListName,
      type: newListType,
      icon: typeOption.icon,
      color: typeOption.color,
      bgColor: typeOption.bgColor,
      items: [],
      createdAt: new Date()
    };

    setLists([...lists, newList]);
    setNewListName('');
    setNewListType('custom');
    setShowCreateModal(false);
  };

  const deleteList = (listId: number) => {
    // Estä pääostoslistan poistaminen
    if (listId === 1) {
      alert('Pääostoslistaa ei voi poistaa, koska se on synkronoitu ruokasuunnittelun kanssa.');
      return;
    }
    setLists(lists.filter(list => list.id !== listId));
  };

  const addItemToList = (listId: number) => {
    const itemText = newItem[listId]?.trim();
    if (!itemText) return;

    const newItemObj: ListItem = {
      id: Date.now(),
      text: itemText,
      completed: false,
      quantity: newItemQuantity[listId]?.trim() || undefined
    };

    if (listId === 1) {
      // Päivitä jaettu ostoslista
      setSharedShoppingList([...sharedShoppingList, newItemObj]);
    } else {
      // Päivitä muut listat
      setLists(lists.map(list => 
        list.id === listId 
          ? { ...list, items: [...list.items, newItemObj] }
          : list
      ));
    }

    setNewItem({ ...newItem, [listId]: '' });
    setNewItemQuantity({ ...newItemQuantity, [listId]: '' });
  };

  const toggleItem = (listId: number, itemId: number) => {
    if (listId === 1) {
      // Päivitä jaettu ostoslista
      setSharedShoppingList(sharedShoppingList.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ));
    } else {
      // Päivitä muut listat
      setLists(lists.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: list.items.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            }
          : list
      ));
    }
  };

  const deleteItem = (listId: number, itemId: number) => {
    if (listId === 1) {
      // Päivitä jaettu ostoslista
      setSharedShoppingList(sharedShoppingList.filter(item => item.id !== itemId));
    } else {
      // Päivitä muut listat
      setLists(lists.map(list => 
        list.id === listId 
          ? { ...list, items: list.items.filter(item => item.id !== itemId) }
          : list
      ));
    }
  };

  const clearCompletedItems = () => {
    // Poista vain valmiit kohteet pääostoslistasta
    const filteredList = sharedShoppingList.filter(item => !item.completed);
    setSharedShoppingList(filteredList);
  };

  const getListProgress = (list: CustomList) => {
    const completed = list.items.filter(item => item.completed).length;
    const total = list.items.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCompletedItemsCount = () => {
    return sharedShoppingList.filter(item => item.completed).length;
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Listat</h2>
          <p className="text-slate-600">Järjestä ostoslistoja, pakkauslistoja ja muita</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Uusi lista</span>
        </button>
      </div>

      {/* Synkronointitiedote */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Ostoslista synkronoitu ruokasuunnittelun kanssa
              </p>
              <p className="text-xs text-blue-600">
                "Viikon ruokaostokset" -lista päivittyy automaattisesti kun päivität ostoslistan ruokasuunnittelussa.
              </p>
            </div>
          </div>
          {getCompletedItemsCount() > 0 && (
            <button
              onClick={clearCompletedItems}
              className="flex items-center space-x-2 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm"
              title="Poista valmiit kohteet ostoslistasta"
            >
              <Trash2 className="h-4 w-4" />
              <span>Poista valmiit ({getCompletedItemsCount()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Listojen yleiskatsaus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lists.map(list => {
          const progress = getListProgress(list);
          return (
            <div key={list.id} className={`${list.bgColor} rounded-xl p-4 border border-slate-200/50`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {React.createElement(getIcon(list.icon), { className: `h-5 w-5 ${list.color}` })}
                  <span className="font-semibold text-slate-800 truncate">{list.name}</span>
                  {list.id === 1 && (
                    <RefreshCw className="h-4 w-4 text-blue-500" title="Synkronoitu ruokasuunnittelun kanssa" />
                  )}
                </div>
                {list.id !== 1 && (
                  <button
                    onClick={() => deleteList(list.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                  <span>{progress.completed}/{progress.total} kohdetta</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${list.color.replace('text-', 'bg-')}`}
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                {list.id === 1 ? 'Synkronoitu ruokasuunnittelun kanssa' : `Luotu ${list.createdAt.toLocaleDateString('fi-FI')}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Yksityiskohtaiset listat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lists.map(list => (
          <div key={list.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${list.bgColor} p-3 rounded-lg`}>
                {React.createElement(getIcon(list.icon), { className: `h-6 w-6 ${list.color}` })}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-slate-800">{list.name}</h3>
                  {list.id === 1 && (
                    <RefreshCw className="h-4 w-4 text-blue-500" title="Synkronoitu ruokasuunnittelun kanssa" />
                  )}
                </div>
                <p className="text-sm text-slate-600 capitalize">
                  {listTypeOptions.find(opt => opt.value === list.type)?.label} • {list.items.filter(item => !item.completed).length} jäljellä
                </p>
              </div>
            </div>

            {/* Lisää uusi kohde */}
            <div className="mb-6 space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Lisää kohde..."
                  value={newItem[list.id] || ''}
                  onChange={(e) => setNewItem({ ...newItem, [list.id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItemToList(list.id)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {list.type === 'shopping' && (
                  <input
                    type="text"
                    placeholder="Määrä"
                    value={newItemQuantity[list.id] || ''}
                    onChange={(e) => setNewItemQuantity({ ...newItemQuantity, [list.id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addItemToList(list.id)}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                <button
                  onClick={() => addItemToList(list.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Kohdelista */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {list.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                    item.completed 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(list.id, item.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 hover:border-green-500'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                  </button>
                  
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`${item.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item.text}
                    </span>
                    {item.quantity && (
                      <span className="text-sm text-slate-600 ml-2">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteItem(list.id, item.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {list.items.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {React.createElement(getIcon(list.icon), { className: 'h-12 w-12 mx-auto mb-2 opacity-50' })}
                  <p>Ei kohteita vielä. Lisää yksi yllä!</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Luo uusi lista -modaali */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Luo uusi lista</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Listan nimi</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Syötä listan nimi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Listan tyyppi</label>
                <div className="space-y-2">
                  {listTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="listType"
                        value={option.value}
                        checked={newListType === option.value}
                        onChange={(e) => setNewListType(e.target.value as 'shopping' | 'packing' | 'custom')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        {React.createElement(getIcon(option.icon), { className: `h-4 w-4 ${option.color}` })}
                        <span className="text-slate-800">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={createNewList}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Luo lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListManager;