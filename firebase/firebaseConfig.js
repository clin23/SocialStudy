{\rtf1\ansi\ansicpg1252\cocoartf2707
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const appId = typeof __app_id !== 'undefined' ? __app_id : 'socialstudy-default-app';\
\
export const usersCollectionPath = `/artifacts/$\{appId\}/public/data/users`;\
export const studySessionsCollectionPath = `/artifacts/$\{appId\}/public/data/studySessions`;\
export const likesCollectionPath = `/artifacts/$\{appId\}/public/data/likes`;\
export const commentsCollectionPath = `/artifacts/$\{appId\}/public/data/comments`;\
export const groupsCollectionPath = `/artifacts/$\{appId\}/public/data/groups`;\
export const getTodosCollectionPath = (userId) => `/artifacts/$\{appId\}/users/$\{userId\}/todos`;}