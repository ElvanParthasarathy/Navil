import React from 'react';

const About = () => {
    return (
        <div className="page-view page-fade" id="content-area">
            <div className="hero-section">
                <h1 className="title">About Me</h1>
                <h2 className="subtitle">Hi, I'm Elvan.</h2>
            </div>

            <div className="about-text" style={{ maxWidth: '650px', margin: '0 auto', padding: '0 20px' }}>
                <p>
                    My real name is <strong>Jaiprakash P</strong>.<br />
                    <strong>Elvan Parthasarathy</strong> is the name I chose for my creations, inventions, and innovations.<br />
                    Academically, I go by <strong>Jaiprakash P</strong>.
                </p>

                <p>
                    I’m currently pursuing my <strong>Bachelor of Engineering</strong><br />
                    at <strong>RMD Engineering College</strong>,<br />
                    and I’m in my <strong>pre-final year</strong>.
                </p>

                <p>
                    I’m not active on social media apart from<br />
                    WhatsApp, LinkedIn, and Snapchat.<br />
                    I prefer a quieter space where I can write, think, and create freely.
                </p>

                <div className="closing-lines">
                    <p>
                        This website is where I share:<br />
                        A simple place.<br />
                        My own place.<br />
                        Where every word is mine.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
