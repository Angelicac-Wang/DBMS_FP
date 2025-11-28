CREATE TABLE USERS (
    u_id BIGINT PRIMARY KEY,
    name VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(15) NOT NULL,
    birthdate DATE NOT NULL,
    gender CHAR NOT NULL CHECK (gender IN ('B','G')),
    region VARCHAR(20) NOT NULL,
    phone CHAR(10) NOT NULL UNIQUE,
    status CHAR NOT NULL CHECK (status IN ('A','N')),
    create_at TIMESTAMP NOT NULL,
    last_login TIMESTAMP NOT NULL,
    role CHAR NOT NULL CHECK (role IN ('U','A'))
);

CREATE TABLE KPOP_SONGS (
    song_id BIGINT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    title_kr VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    duration INT NOT NULL,
    difficulty_level INT NOT NULL CHECK (difficulty_level BETWEEN 0 AND 10),
    spotify_url VARCHAR(100),
    youtube_original_url VARCHAR(100) NOT NULL
);

CREATE TABLE USER_SKILLS (
    u_id BIGINT NOT NULL,
    skill_type VARCHAR(15) NOT NULL,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 0 AND 100),
    years_of_experience INT NOT NULL,
    discription VARCHAR(200),
    PRIMARY KEY (u_id, skill_type),
    FOREIGN KEY (u_id)
        REFERENCES USERS(u_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE USER_SOCIAL_LINK (
    url VARCHAR(100) PRIMARY KEY,
    u_id BIGINT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    follower_cnt INT NOT NULL,
    FOREIGN KEY (u_id)
        REFERENCES USERS(u_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE VIDEO_DETAIL (
    video_url VARCHAR(100) PRIMARY KEY,
    cover_song_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    view_cnt INT NOT NULL,
    FOREIGN KEY (cover_song_id)
        REFERENCES KPOP_SONGS(song_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE PORTFOLIOS (
    u_id BIGINT NOT NULL,
    video_url VARCHAR(100) NOT NULL,
    title VARCHAR(20) NOT NULL,
    discription VARCHAR(500),
    PRIMARY KEY (u_id, video_url),
    FOREIGN KEY (u_id)
        REFERENCES USERS(u_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (video_url)
        REFERENCES VIDEO_DETAIL(video_url)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE PROJECT (
    p_id BIGINT PRIMARY KEY,
    creator_id BIGINT NOT NULL DEFAULT 00000000,
    song_id BIGINT,
    porject_title VARCHAR(50) NOT NULL,
    target_cnt INT NOT NULL,
    practice_location VARCHAR(50) NOT NULL,
    performance_location VARCHAR(50) NOT NULL,
    create_at TIMESTAMP NOT NULL,
    update_at TIMESTAMP NOT NULL,
    status CHAR NOT NULL CHECK (status IN ('A','D','F')),
    discription VARCHAR(500),
    FOREIGN KEY (creator_id)
        REFERENCES USERS(u_id)
        ON DELETE SET DEFAULT
        ON UPDATE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES KPOP_SONGS(song_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE KPOP_GROUPS (
    group_id BIGINT PRIMARY KEY,
    group_name VARCHAR(20) NOT NULL,
    group_namekr VARCHAR(20),
    debut_date DATE NOT NULL,
    company VARCHAR(20) NOT NULL,
    group_type CHAR NOT NULL CHECK (group_type IN ('B','G','M')),
    member_count INT NOT NULL,
    logo_image VARCHAR(100),
    discription CHAR(500)
);

CREATE TABLE KPOP_IDOLS (
    idol_id BIGINT PRIMARY KEY,
    group_id BIGINT,
    nationality VARCHAR(20) NOT NULL,
    stage_name VARCHAR(30) NOT NULL,
    stage_name_kr VARCHAR(30) NOT NULL,
    debut_date DATE NOT NULL,
    FOREIGN KEY (group_id)
        REFERENCES KPOP_GROUPS(group_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE SONG_GROUP (
    song_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    PRIMARY KEY (song_id, group_id),
    FOREIGN KEY (song_id)
        REFERENCES KPOP_SONGS(song_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (group_id)
        REFERENCES KPOP_GROUPS(group_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE SONG_IDOL (
    song_id BIGINT NOT NULL,
    idol_id BIGINT NOT NULL,
    PRIMARY KEY (song_id, idol_id),
    FOREIGN KEY (song_id)
        REFERENCES KPOP_SONGS(song_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (idol_id)
        REFERENCES KPOP_IDOLS(idol_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE PRACTICE_SCHEDULE (
    p_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (p_id, date),
    FOREIGN KEY (p_id)
        REFERENCES PROJECT(p_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE PROJECT_TARGET (
    target_seq INT NOT NULL,
    project_id BIGINT NOT NULL,
    idol_id BIGINT,
    status CHAR CHECK (status IN ('F','I','D')),
    PRIMARY KEY (target_seq, project_id),
    FOREIGN KEY (project_id)
        REFERENCES PROJECT(p_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (idol_id)
        REFERENCES KPOP_IDOLS(idol_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE PROJECT_MEMBERS (
    p_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    join_date DATE NOT NULL,
    target_seq INT NOT NULL,
    status CHAR NOT NULL CHECK (status IN ('Y','N')),
    PRIMARY KEY (p_id, member_id),
    FOREIGN KEY (p_id)
        REFERENCES PROJECT(p_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (member_id)
        REFERENCES USERS(u_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (target_seq, p_id)
        REFERENCES PROJECT_TARGET(target_seq, project_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE PROJECT_APPLICATIONS (
    Appli_id BIGINT PRIMARY KEY,
    p_id BIGINT NOT NULL,
    target_seq INT NOT NULL,
    applicant_id BIGINT NOT NULL,
    applied_time TIMESTAMP NOT NULL,
    reviewed_time TIMESTAMP,
    status CHAR NOT NULL CHECK (status IN ('A','R','W','C')),
    FOREIGN KEY (p_id)
        REFERENCES PROJECT(p_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (target_seq, p_id)
        REFERENCES PROJECT_TARGET(target_seq, project_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (applicant_id)
        REFERENCES USERS(u_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);