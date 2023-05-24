import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import * as auth from "../utils/auth.js";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import Register from "./Register";
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import api from "../utils/Api";
import React from "react";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRouteElement from "./ ProtectedRoute";

function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusInfoTooltip, setStatusInfoTooltip] = React.useState(false);

  const navigate = useNavigate();

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
    const [isInfoTooltipPopupOpen, setInfoTooltipPopupOpen] = React.useState(false);
  //попап удаления
  const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] =
    React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({
    isOpen: false,
    item: {},
  });

  React.useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, cards]) => {
        setCurrentUser(userData);
        setCards(cards);
      })
      .catch((err) => console.log(err));
  }, []);

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }
  //попап удаления
  function handleDeleteCardClick() {
    setIsDeleteCardPopupOpen(true);
  }

  // function handleIsLoading(){

  // }

  // закрытие всех попапов
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setInfoTooltipPopupOpen(false);
    setIsDeleteCardPopupOpen(false);
    setSelectedCard({
      isOpen: false,
      item: {},
    });
  }

  const isOpen =
    isEditAvatarPopupOpen ||
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    selectedCard.isOpen;

  //закрытие по "Escape"
  React.useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === "Escape") {
        closeAllPopups();
      }
    }
    if (isOpen) {
      // навешиваем только при открытии
      document.addEventListener("keydown", closeByEscape);
      return () => {
        document.removeEventListener("keydown", closeByEscape);
      };
    }
  }, [isOpen]);

  function handleUpdateUser(name, about) {
    setIsLoading(true);
    api
      .editUserInfo(name, about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUpdateAvatar(avatar) {
    setIsLoading(true);
    api
      .editUserAvatar(avatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleAddPlaceSubmit(name, link) {
    setIsLoading(true);
    api
      .addNewCard(name, link)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    if (!isLiked) {
      // Отправляем запрос в API и получаем обновлённые данные карточки
      api
        .putLike(card._id, !isLiked)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((err) => console.log(err));
    } else {
      api
        .deleteLike(card._id, !isLiked)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((err) => console.log(err));
    }
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then((newCard) => {
        const newCards = cards.filter((c) =>
          c._id === card._id ? "" : newCard
        );
        setCards((state) => state.filter((item) => item._id !== card._id));
        //setCards(newCards);
      })
      .catch((err) => console.log(err));
  }

  function handleLogin(email, password){
    auth.authorize(email, password)
    .then((data) => {
      if(data.token){
        checkAuthToken();
        setLoggedIn(true);
        navigate("/cards", { replace: true });
  }})
    .catch((err) => {
      console.log(err);
      setStatusInfoTooltip(false);
      setInfoTooltipPopupOpen(true);
    })
  };

  function handleRegister(email, password){
    auth.register(email, password)
    .then(() => {
      navigate("/signin", { replace: true });
      setStatusInfoTooltip(true);
    })
    .catch((err) => {
      console.log(err);
      setStatusInfoTooltip(false);
    })
    .finally(() => {
      setInfoTooltipPopupOpen(true);
    });
}

function signOut() {
  localStorage.removeItem("token");
  // setUserData("");
  setLoggedIn(false);
  navigate("/signin", { replace: true });
}

  const checkAuthToken = () => {
    const token = localStorage.getItem("token");
    if(token){
      auth.checkToken(token)
      .then((res) => {
        if(res){
          const email = res.data.email;
          setUserData(email);
          setLoggedIn(true);
          navigate("/cards", {replace: true})
        }
      }).catch((err) => console.log(err))
    } 
  };

  React.useEffect(() => {
    checkAuthToken();
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <div className="page">
          <Header userData={userData} signOut={signOut}/>
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  loggedIn ? (
                    <Navigate to="/cards" replace />
                  ) : (
                    <Navigate to="/signup" replace />
                  )
                }
              />
              <Route
                path="/signup"
                element={<Register handleRegister={handleRegister} />}
              />
              <Route
                path="/signin"
                element={<Login handleLogin={handleLogin} />}
              />
              <Route
                path="/cards"
                element={
                  <ProtectedRouteElement
                    loggedIn={loggedIn}
                    element={Main}
                    onEditProfile={handleEditProfileClick}
                    onEditAvatar={handleEditAvatarClick}
                    onAddPlace={handleAddPlaceClick}
                    onCardClick={setSelectedCard}
                    // onCardDeletePopup={handleDeleteCardClick}
                    cards={cards}
                    onCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                  />
                }
              />
              <Route path="*" element={<h2>Not found</h2>} />
            </Routes>
          </main>

          {loggedIn ? <Footer /> : ""}
          <InfoTooltip
            isOpen={isInfoTooltipPopupOpen}
            onClose={closeAllPopups}
            status={statusInfoTooltip}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            isLoading={isLoading}
          />
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            isLoading={isLoading}
          />
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
            isLoading={isLoading}
          />
          <PopupWithForm
            name="delete"
            title="Вы уверены?"
            isOpen={isDeleteCardPopupOpen}
            onClose={closeAllPopups}
            btnText="Да"
          />
          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
