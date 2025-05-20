import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaRocket, FaBrain, FaClock, FaComments, FaSun, FaMoon } from 'react-icons/fa';
import botImage from '../assets/rmintellibuddy.png';
import { useTheme } from '../theme/ThemeProvider';

const MainPage: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTextSection
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Heading>IntelliBuddy</Heading>
            <Tagline>Your AI Assistant</Tagline>
            <Description>
              Get intelligent answers, personalized help, and smart recommendations with our advanced
              AI-powered chatbot. Available 24/7 to assist you with anything you need.
            </Description>
            <ButtonGroup>
              <Button onClick={scrollToFeatures}>
                Learn More
              </Button>
              <Button onClick={toggleTheme} isMode>
                {isDarkMode ? <FaSun /> : <FaMoon />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </ButtonGroup>
          </HeaderTextSection>

          <HeaderImageSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <RobotImageContainer>
              <img src={botImage} alt="IntelliBuddy" width="100%" />
            </RobotImageContainer>
          </HeaderImageSection>
        </HeaderContent>
      </Header>

      <FeaturesSection ref={featuresRef}>
        <SectionTitle>Why Choose IntelliBuddy?</SectionTitle>
        <Underline />

        <FeatureGrid>
          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FeatureIconWrapper bg={theme.colors.secondary}>
              <FaRocket />
            </FeatureIconWrapper>
            <FeatureTitle>Smart Responses</FeatureTitle>
            <FeatureDescription>
              Get intelligent, context-aware answers to your questions in seconds
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FeatureIconWrapper bg={theme.colors.accent}>
              <FaBrain />
            </FeatureIconWrapper>
            <FeatureTitle>Adaptive Learning</FeatureTitle>
            <FeatureDescription>
              IntelliBuddy adapts to your website context and user preferences
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FeatureIconWrapper bg={theme.colors.primary}>
              <FaClock />
            </FeatureIconWrapper>
            <FeatureTitle>24/7 Availability</FeatureTitle>
            <FeatureDescription>
              Get help whenever you need it, day or night with instant responses
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FeatureIconWrapper bg={theme.colors.secondary}>
              <FaComments />
            </FeatureIconWrapper>
            <FeatureTitle>Easy Integration</FeatureTitle>
            <FeatureDescription>
              Seamlessly integrate with your existing website or application
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>

      <HowItWorksSection>
        <SectionTitle>How It Works</SectionTitle>
        <Underline />

        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>Ask a Question</StepTitle>
            <StepDescription>Type your question or request in the chat widget</StepDescription>
          </Step>

          <StepConnector />

          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>AI Processing</StepTitle>
            <StepDescription>IntelliBuddy processes your query using advanced AI</StepDescription>
          </Step>

          <StepConnector />

          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>Get Your Answer</StepTitle>
            <StepDescription>Receive a personalized, accurate response instantly</StepDescription>
          </Step>
        </StepsContainer>
      </HowItWorksSection>

      {/* After HowItWorksSection and before TestimonialsSection */}
      <AdvancedFeaturesSection>
        <SectionTitle>Advanced Features</SectionTitle>
        <Underline />

        <FeaturesContainer>
          <FeaturesHeader>
            <FeaturesHeading>IntelliBuddy Features</FeaturesHeading>
            <FeaturesIntro>
              IntelliBuddy is a cutting-edge AI assistant powered by Google's Gemini model.
              Experience these powerful capabilities:
            </FeaturesIntro>
          </FeaturesHeader>

          <FeaturesGrid>
            <FeatureItem>
              <FeatureIcon><FaComments /></FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Context-Aware Conversations</FeatureItemTitle>
                <FeatureItemDesc>Remembers your entire conversation history</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon><FaClock /></FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Time-Based Greetings</FeatureItemTitle>
                <FeatureItemDesc>Adjusts to your local time of day</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>🌎</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Multi-Language Support</FeatureItemTitle>
                <FeatureItemDesc>Communicates in 10+ languages</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>💡</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Smart Suggestions</FeatureItemTitle>
                <FeatureItemDesc>Offers context-aware response options</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>{isDarkMode ? <FaMoon /> : <FaSun />}</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Light & Dark Mode</FeatureItemTitle>
                <FeatureItemDesc>Adjusts to your visual preference</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>❤️</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Message Reactions</FeatureItemTitle>
                <FeatureItemDesc>Express feelings with emoji reactions</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>⏱️</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Rate-Limiting Awareness</FeatureItemTitle>
                <FeatureItemDesc>Optimizes your experience automatically</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>📶</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Offline Detection</FeatureItemTitle>
                <FeatureItemDesc>Maintains continuity during connection issues</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>🧠</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Personal Memory</FeatureItemTitle>
                <FeatureItemDesc>Remembers details across sessions</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>📝</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Markdown Rendering</FeatureItemTitle>
                <FeatureItemDesc>Displays beautifully formatted responses</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>📋</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Message Copying</FeatureItemTitle>
                <FeatureItemDesc>Share information with ease</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureContent>
                <FeatureItemTitle>Business Knowledge Integration</FeatureItemTitle>
                <FeatureItemDesc>Tailors responses based on company data</FeatureItemDesc>
              </FeatureContent>
            </FeatureItem>

          </FeaturesGrid>
        </FeaturesContainer>
      </AdvancedFeaturesSection>


      <TestimonialsSection>
        <SectionTitle>What Our Users Say</SectionTitle>
        <Underline />

        <TestimonialGrid>
          <TestimonialCard>
            <TestimonialText>
              "IntelliBuddy has transformed how we handle customer inquiries. It's like having an extra team member!"
            </TestimonialText>
            <TestimonialAuthor>Sarah J., Marketing Director</TestimonialAuthor>
          </TestimonialCard>

          <TestimonialCard>
            <TestimonialText>
              "The responses are so natural, our customers often don't realize they're talking to an AI. Impressive technology!"
            </TestimonialText>
            <TestimonialAuthor>Mark T., E-commerce Owner</TestimonialAuthor>
          </TestimonialCard>

          <TestimonialCard>
            <TestimonialText>
              "Setup was incredibly easy, and the way it adapts to our website content is remarkable. Highly recommended!"
            </TestimonialText>
            <TestimonialAuthor>Elena R., Web Developer</TestimonialAuthor>
          </TestimonialCard>
        </TestimonialGrid>
      </TestimonialsSection>

      <Footer>
        <Copyright>
          © 2025 IntelliBuddy
        </Copyright>
      </Footer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled.header`
  background-color: ${props => props.theme.colors.background};
  padding: 4rem 2rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeaderTextSection = styled(motion.div)`
  flex: 1;
`;

const Heading = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const Tagline = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 992px) {
    margin: 0 auto 2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }
`;

const Button = styled.button<{ isMode?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${props => props.isMode ? props.theme.colors.primary : props.theme.colors.secondary};
  color: ${props => props.theme.colors.buttonText};
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
    background-color: ${props => props.isMode ? props.theme.colors.accent : props.theme.colors.secondary};
  }
  
  svg {
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HeaderImageSection = styled(motion.div)`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const RobotImageContainer = styled.div`
  width: 400px;
  max-width: 100%;
  animation: float 6s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  
  @media (max-width: 768px) {
    width: 300px;
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 2rem;
  background-color: ${props => props.theme.colors.cardBg};
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Underline = styled.div`
  width: 80px;
  height: 4px;
  background-color: ${props => props.theme.colors.accent};
  margin: 0 auto 3rem;
  border-radius: 2px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.background};
  border-radius: var(--border-radius, 12px);
  padding: 2rem;
  box-shadow: ${props => props.theme.colors.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AdvancedFeaturesSection = styled.section`
  padding: 5rem 2rem;
  background-color: ${props => props.theme.colors.background};
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.cardBg};
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: ${props => props.theme.colors.shadow};
`;

const FeaturesHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const FeaturesHeading = styled.h3`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1rem;
`;

const FeaturesIntro = styled.p`
  color: ${props => props.theme.colors.text};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.accent}10;
    transform: translateY(-3px);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  background-color: ${props => props.theme.colors.accent}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
`;

const FeatureContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const FeatureItemTitle = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.primary};
`;

const FeatureItemDesc = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.text};
`;


const FeatureIconWrapper = styled.div<{ bg: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  line-height: 1.6;
`;

const HowItWorksSection = styled.section`
  padding: 5rem 2rem;
  background-color: ${props => props.theme.colors.background};
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const Step = styled.div`
  background-color: ${props => props.theme.colors.cardBg};
  border-radius: var(--border-radius, 12px);
  padding: 2rem;
  text-align: center;
  flex: 1;
  max-width: 280px;
  box-shadow: ${props => props.theme.colors.shadow};
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-weight: bold;
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: ${props => props.theme.colors.primary};
`;

const StepDescription = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
`;

const StepConnector = styled.div`
  height: 2px;
  background-color: ${props => props.theme.colors.accent};
  width: 80px;
  
  @media (max-width: 768px) {
    width: 2px;
    height: 40px;
  }
`;

const TestimonialsSection = styled.section`
  padding: 5rem 2rem;
  background-color: ${props => props.theme.colors.cardBg};
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TestimonialCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: var(--border-radius, 12px);
  padding: 2.5rem;
  box-shadow: ${props => props.theme.colors.shadow};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const TestimonialText = styled.p`
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${props => props.theme.colors.text};
  flex-grow: 1;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
`;

const TestimonialAuthor = styled.p`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  text-align: right;
  font-size: 0.95rem;
`;

const Footer = styled.footer`
  background-color: ${props => props.theme.colors.footer};
  padding: 1.5rem;
  text-align: center;
  margin-top: auto;
  
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.copyright};
  font-size: 0.95rem;
`;

export default MainPage;
