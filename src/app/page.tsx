'use client'

import React, { useEffect, useRef, useState } from 'react'
import ChatBot, { Button } from 'react-chatbotify'
import axios from 'axios'
import '/public/styles/chatbot-style.css'

import Box from '@mui/material/Box'
import { Params } from '@/types/Params'
import { districtFlow } from './flows/district-flow'
import { uploadFileFlow } from './flows/upload-file-flow'

export default function Home() {
  const [form, setForm] = React.useState<{ district: string }>({
    district: '',
  })

  const [isEnlargeMode, setIsEnlargeMode] = useState(false) // 확대 모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState(false)

  const DARK_MODE_ICON = 'https://img.icons8.com/?size=100&id=1NVn5K29mOSz&format=png&color=ffffff'
  const LIGHT_MODE_ICON = 'https://img.icons8.com/?size=100&id=1NVn5K29mOSz&format=png&color=0000000'

  // 확대 모드 함수
  const toggleEnlargeMode = async () => {
    setIsEnlargeMode((prev) => !prev)

    if (!isEnlargeMode) {
      document.body.classList.add('enlarge-mode')
      const { loadCSS } = await import('@/app/utils/styles') // utils 폴더의 styles.tsx
      await loadCSS('/styles/enlargemode-style.css') // public/styles 경로에 맞게 수정
      console.log('Enlarge mode activated')
    } else {
      document.body.classList.remove('enlarge-mode')
      const { removeCSS } = await import('@/app/utils/styles')
      await removeCSS('/styles/enlargemode-style.css')
      console.log('Enlarge mode deactivated')
    }
  }

  // 다크모드 활성화 함수
  const darkModeBtn = async () => {
    const isDarkMode = document.body.classList.toggle('dark-mode') // 다크 모드 활성화 상태 토글
    if (isDarkMode) {
      // 다크 모드 활성화
      const { loadCSS } = await import('@/app/utils/styles') // 동적 import
      await loadCSS('/styles/darkmode-style.css') // darkmode-style.css 파일 로드
      console.log('Dark mode activated')
    } else {
      // 다크 모드 비활성화
      const { removeCSS } = await import('@/app/utils/styles') // 동적 import
      await removeCSS('/styles/darkmode-style.css') // darkmode-style.css 파일 제거
      console.log('Dark mode deactivated')
    }
  }

  const settings = {
    isOpen: false,
    general: {
      fontFamily: 'KoddiUDOnGothic-Regular',
      primaryColor: '#304D30',
      actionDisabledIcon: 'none',
    },
    chatButton: {
      icon: '../../public/images/recycle-icon.png',
    },
    tooltip: {
      mode: 'CLOSE',
      text: 'Click Me!',
    },
    chatHistory: {
      disabled: true,
    },
    chatWindow: {
      showMessagePrompt: false,
    },
    audio: {
      disabled: false,
      defaultToggledOn: true,
      language: 'ko-KR',
      rate: 1,
      volume: 1,
    },
    voice: {
      disabled: false,
      language: 'ko-KR',
      autoSendDisabled: true,
    },
    header: {
      title: (
        <div className="header-container">
          <div className="header-title">Green Seoul Bot</div>
        </div>
      ),
      avatar: '',
      showAvatar: false,
      closeChatIcon: LIGHT_MODE_ICON,
      closeChatDisabled: DARK_MODE_ICON,
    },
    botBubble: {
      showAvatar: true,
      avatar: 'https://img.icons8.com/?size=100&id=13446&format=png&color=000000',
      simStream: true,
      streamSpeed: 60,
    },
    notification: {
      disabled: true,
    },
    chatInput: {
      enabledPlaceholderText: '메세지를 입력해주세요.',
      botDelay: 1500,
      sendButtonIcon: 'https://img.icons8.com/?size=100&id=2837&format=png&color=fbfbfb',
    },
    fileAttachment: {
      showMediaDisplay: true,
      sendFileName: false,
      multiple: false,
      accept: '*', // 첨부파일에 허용되는 형식 * 는 전체허용
      icon: 'https://img.icons8.com/?size=100&id=ctfuCrTkdAJ8&format=png&color=304D30',
      iconDisabled: 'https://img.icons8.com/?size=100&id=ctfuCrTkdAJ8&format=png&color=ADB7AC',
    },
    footer: {
      text: (
        <div>
          <span>Team </span>
          <span style={{ fontWeight: 'bold' }}>G.cycle</span>
        </div>
      ),
      buttons: [
        Button.FILE_ATTACHMENT_BUTTON,
        <button key="custom-button" className="darkmode-button" onClick={darkModeBtn}></button>,
      ],
    },
    emoji: {
      disabled: true,
    },
  }

  const inputTextRef = useRef('')

  const helpOptions = ['사용방법', '재활용품 지원정책', '이미지로 대형폐기물 수수료 알아보기', '챗봇 확대하기']
  const howToReCycle = ['재활용품 지원 정책', '이미지로 대형폐기물 수수료 알아보기']

  const flow = {
    start: {
      message:
        '안녕하세요! \n서울 Green Seoul Bot 입니다. \n재활용품과 관련하여 궁금한 것이 있으시다면 무엇이든지 물어보세요!',
      options: helpOptions,
      function: (params: Params) => {
        setForm({ district: params.userInput })
        if (params.userInput === '챗봇 확대하기') {
          toggleEnlargeMode() // '챗봇 확대하기'일 경우만 호출
          console.log(params.userInput)
        }
      },
      path: (params: Params) => {
        inputTextRef.current = params.userInput
        switch (params.userInput) {
          case '사용방법':
            return 'middle'
          case '재활용품 지원정책':
            return 'district_start'
          case '이미지로 대형폐기물 수수료 알아보기':
            return 'uploadFile_district'
          case '챗봇 확대하기':
            return 'enlarge_mode'
          default:
            return 'communicate'
        }
      },
    },

    enlarge_mode: {
      message: '확대모드를 적용 중입니다.',
      function: (params: Params) => {
        setForm({ district: params.userInput })
      },
      options: helpOptions,
      path: (params: Params) => {
        inputTextRef.current = params.userInput
        switch (params.userInput) {
          case '사용방법':
            return 'middle'
          case '재활용품 지원정책':
            return 'district_start'
          case '이미지로 대형폐기물 수수료 알아보기':
            return 'uploadFile_district'
          case '챗봇 확대하기':
            return 'enlarge_mode'
          default:
            return 'communicate'
        }
      },
    },

    middle: {
      message:
        '저는 재활용품과 관련된 여러분들의 궁금증을 해결해 드리는 Green Seoul Bot입니다. \n\n재활용품 지원 정책이나 버리고자 하는 대형폐기물의 사진을 올려주시면 제가 알려드릴게요! \n\n<Green Seoul Bot의 기능> \n1. 재활용품 지원정책 안내 \n정책정보를 확인 할 지역구를 선택하거나 메세지로 입력하시면 해당 지역구에서 시행하는 정책정보를 알려드려요. \n\n2. 대형폐기물 수수료 안내 \n버리고자 하는 대형폐기물의 사진을 첨부하시면 사진을 분석하여 해당 폐기물의 구별 수수료를 알려드려요.',
      function: (params: Params) => {
        setForm({ district: params.userInput })
      },
      options: howToReCycle,
      path: 'how_to_recycle',
    },

    how_to_recycle: {
      transition: { duration: 0 },
      path: (params: Params) => {
        switch (params.userInput) {
          case '재활용품 지원 정책':
            return 'district_start'
          case '이미지로 대형폐기물 수수료 알아보기':
            return 'uploadFile_district'
          default:
            return 'communicate'
        }
      },
    },

    communicate: {
      function: (params: Params) => {
        setForm({ district: params.userInput })
      },
      message: async () => {
        const url = 'http://3.35.192.132:8000/chatbot/chat'
        const user_input = form.district
        try {
          const response = await axios.post(url, { user_input: user_input }).then((response) => {
            form.district = ''
            return response.data.message
          })
          return response
        } catch (error) {
          console.log(error)
        }
      },
      options: (form as any) ? undefined : ['처음으로'],
      path: (params: Params) => {
        switch (params.userInput) {
          case '처음으로':
            return 'start'
          default:
            return 'communicate'
        }
      },
    },

    ...districtFlow({ form, setForm }),
    ...uploadFileFlow({ form, setForm }),
  }

  return (
    <div>
      <Box>
        <ChatBot settings={settings} flow={flow} />
      </Box>
    </div>
  )
}
