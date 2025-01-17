import React, { useState, useEffect } from "react";
import { Outlet, useParams, Link } from "react-router-dom";
import { getBoardCategory, getStudyMembers } from "../../Api/Api";
import { useQuery, useQueryClient } from "react-query";
import { getCookie } from "../../utils/cookie";
import { Category } from "../Categories/Categories";
import styled from "styled-components";
import { SwipeableDrawer, Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close';

const CategoryWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid #e6e6e6;
  .StudyList {
    flex: 1;
    display: flex;
    justify-content: space-between;
    font-size: 1.5rem;
  }
  .MenuIcon {
    font-size: 2rem;
  }
  @media (max-width: 380px) {
    .StudyList {
      flex-direction: column;
    }
  }
`;

const DrawerWrapper = styled(Box)`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  a {
    margin: 0 !important;
  }
`;

const InfoCat = styled(Link)`
  text-decoration: none;
  color: black;
  font-size: 1.6rem;
  &:hover {
    cursor: pointer;
    color: #FFC107;
  }
`

function StudyBoard() {
  const queryClient = useQueryClient();
  const [IsGranted, setIsGranted] = useState(false);
  const { studyId } = useParams();
  const [DrawerState, setDrawerState] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(sessionStorage.getItem('currentBoard')||'공지사항');

  const myinfos = queryClient.getQueryData(["loadMyInfo"]);

  const { data: studyInfos } = useQuery(
    [`studyInfos`, studyId],
    () => getStudyMembers(studyId),
    {
      select: (data) => data.data.data,
      onSuccess: (data) => {
        const myInfo = data.find(
          (info) => info.member?.memberId === myinfos?.data?.data?.id
        );
        if (myInfo?.studyRole === "ADMIN" || myInfo?.studyRole === "CREATOR") {
          setIsGranted(true);
        } else {
          setIsGranted(false);
        }
      },
      staleTime: Infinity,
    }
  );

  const { data: category } = useQuery(
    ["getBoardCategory", studyId],
    () => getBoardCategory(studyId, getCookie("accessToken")),
    {
      select: (cat) => cat.data.data,
      retry: false,
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    if (!!myinfos?.data?.data?.nickname && !!studyInfos) {
      //console.log(myinfos);
      const {
        data: {
          data: { id },
        },
      } = myinfos;
      const myInfo = studyInfos?.find((info) => info.member?.memberId === id);
      if (myInfo?.studyRole === "ADMIN" || myInfo?.studyRole === "CREATOR") {
        setIsGranted(true);
      } else {
        setIsGranted(false);
      }
    }
  }, [myinfos, studyInfos]);

  const handleCurrentBoard = (title) => {
    setCurrentBoard(title);
    sessionStorage.setItem('currentBoard', title);
  };

  return (
    <>
      <CategoryWrapper>
        <IconButton onClick={() => setDrawerState(true)}>
          <MenuIcon className="MenuIcon" />
        </IconButton>
        <div className="StudyList">
          <p style={{fontFamily:'SEBANG_Gothic_Bold, sans-serif'}}>스터디 게시판 목록-<span style={{color:'#0049AF'}}>{currentBoard}</span></p>
        </div>
        <SwipeableDrawer
          anchor="left"
          open={DrawerState}
          onClose={() => setDrawerState(false)}
          onOpen={() => setDrawerState(true)}
        >
          <DrawerWrapper
            role="presentation"
            onClick={() => setDrawerState(false)}
            onKeyDown={() => setDrawerState(false)}
          >
            <IconButton style={{alignSelf:'flex-end'}} onClick={() => setDrawerState(false)}>
              <CloseIcon />
            </IconButton>
            {category?.map((cat) => (
              <Category
                activeclassname="active"
                to={`/study/${studyId}/board/${cat.id}/articles`}
                key={cat.id}
                onClick={()=>handleCurrentBoard(cat.title)}
              >
                {cat.title}
              </Category>
            ))}
            <Category activeclassname="active" to={`/study/${studyId}/board/calendar`} onClick={()=>handleCurrentBoard('캘린더')}>
              스터디 캘린더
            </Category>
            <Category activeclassname="active" to={`/study/${studyId}/board/rooms`} onClick={() => handleCurrentBoard('화상채팅')} >
              스터디 화상채팅
            </Category>
            <InfoCat to={`/study/${studyId}`}>
              게시판 정보
            </InfoCat>
            {(IsGranted || myinfos?.data.data.authority === 'ROLE_ADMIN') && (
              <Category activeclassname="active" to={`/study/${studyId}/board/manage`} onClick={()=>handleCurrentBoard('게시판 관리')}>
                게시판 관리
              </Category>
            )}
          </DrawerWrapper>
        </SwipeableDrawer>
      </CategoryWrapper>

      <Outlet />
    </>
  );
}

export default StudyBoard;
