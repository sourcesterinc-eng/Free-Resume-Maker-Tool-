class ResumeBuilder {
    constructor() {
        this.form = document.getElementById('resumeForm');
        this.preview = document.getElementById('resumePreview');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.templateSelect = document.getElementById('templateSelect');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
    }

    bindEvents() {
        // Real-time preview generation
        this.form.addEventListener('input', () => this.debounce(this.generatePreview, 300)());
        
        this.generateBtn.addEventListener('click', () => {
            this.generatePreview();
            this.downloadBtn.style.display = 'flex';
        });

        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        document.getElementById('addExperience').addEventListener('click', () => this.addEntry('experience'));
        document.getElementById('addEducation').addEventListener('click', () => this.addEntry('education'));
        
        this.templateSelect.addEventListener('change', () => this.generatePreview());
    }

    addEntry(type) {
        const container = document.getElementById(type + 'Entries');
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = type === 'experience' ? 
            `<input type="text" class="job-title" placeholder="Job Title">
             <input type="text" class="company" placeholder="Company">
             <input type="text" class="dates" placeholder="Dates (2020 - Present)">
             <textarea class="description" rows="2" placeholder="Job responsibilities..."></textarea>` :
            `<input type="text" class="degree" placeholder="Degree">
             <input type="text" class="school" placeholder="School/University">
             <input type="text" class="edu-dates" placeholder="Year of Graduation">`;
        container.appendChild(entry);
        this.saveToStorage();
    }

    generatePreview() {
        const data = this.collectData();
        const template = this.templateSelect.value;
        
        this.preview.innerHTML = `
            <div class="resume-preview template-${template}">
                ${data.photo ? `<img src="${data.photo}" class="photo" style="width:100px;height:100px;border-radius:50%;float:right;">` : ''}
                <h1>${data.name || 'Your Name'}</h1>
                <div class="subtitle">${data.title || ''}</div>
                
                <div class="contact-info">
                    ${data.email ? `<a href="mailto:${data.email}"><i class="fas fa-envelope"></i> ${data.email}</a>` : ''}
                    ${data.phone ? `<a href="tel:${data.phone}"><i class="fas fa-phone"></i> ${data.phone}</a>` : ''}
                    ${data.location ? `<span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>` : ''}
                    ${data.linkedin ? `<a href="${data.linkedin}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                </div>

                ${data.objective ? `
                    <div class="section">
                        <h2><i class="fas fa-bullseye"></i> Professional Summary</h2>
                        <p>${data.objective}</p>
                    </div>
                ` : ''}

                ${data.experience.length > 0 ? `
                    <div class="section">
                        <h2><i class="fas fa-briefcase"></i> Experience</h2>
                        ${data.experience.map(job => `
                            <div class="job-entry">
                                <h3>${job.title} <span style="color:#666;font-size:0.9rem;">@ ${job.company}</span></h3>
                                <p style="color:#888;font-size:0.9rem;">${job.dates}</p>
                                <p>${job.description}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${data.education.length > 0 ? `
                    <div class="section">
                        <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                        ${data.education.map(edu => `
                            <div class="edu-entry">
                                <h3>${edu.degree}</h3>
                                <p>${edu.school} • ${edu.dates}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${data.skills ? `
                    <div class="section">
                        <h2><i class="fas fa-tools"></i> Skills</h2>
                        <div class="skills-list">
                            ${data.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        this.saveToStorage();
    }

    collectData() {
        const experienceEntries = document.querySelectorAll('#experienceEntries .entry');
        const educationEntries = document.querySelectorAll('#educationEntries .entry');
        
        return {
            name: document.getElementById('name').value,
            title: document.getElementById('title').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            photo: this.getPhotoPreview(),
            objective: document.getElementById('objective').value,
            experience: Array.from(experienceEntries).map(entry => ({
                title: entry.querySelector('.job-title').value,
                company: entry.querySelector('.company').value,
                dates: entry.querySelector('.dates').value,
                description: entry.querySelector('.description').value
            })).filter(job => job.title),
            education: Array.from(educationEntries).map(entry => ({
                degree: entry.querySelector('.degree').value,
                school: entry.querySelector('.school').value,
                dates: entry.querySelector('.edu-dates').value
            })).filter(edu => edu.degree),
            skills: document.getElementById('skills').value
        };
    }

    getPhotoPreview() {
        const fileInput = document.getElementById('photo');
        if (fileInput.files && fileInput.files[0]) {
            return URL.createObjectURL(fileInput.files[0]);
        }
        return '';
    }

    downloadPDF() {
        const element = document.getElementById('resumePreview');
        const opt = {
            margin: 0.5,
            filename: 'resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }

    clearAll() {
        if (confirm('Clear all data?')) {
            localStorage.removeItem('resumeData');
            this.form.reset();
            document.getElementById('experienceEntries').innerHTML = `
                <div class="entry">
                    <input type="text" class="job-title" placeholder="Job Title">
                    <input type="text" class="company" placeholder="Company">
                    <input type="text" class="dates" placeholder="Dates (2020 - Present)">
                    <textarea class="description" rows="2" placeholder="Job responsibilities..."></textarea>
                </div>
            `;
            document.getElementById('educationEntries').innerHTML = `
                <div class="entry">
                    <input type="text" class="degree" placeholder="Degree">
                    <input type="text" class="school" placeholder="School/University">
                    <input type="text" class="edu-dates" placeholder="Year of Graduation">
                </div>
            `;
            this.preview.innerHTML = '';
            this.downloadBtn.style.display = 'none';
        }
    }

    saveToStorage() {
        const data = this.collectData();
        localStorage.setItem('resumeData', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = JSON.parse(localStorage.getItem('resumeData'));
        if (data) {
            document.getElementById('name').value = data.name || '';
            document.getElementById('title').value = data.title || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('location').value = data.location || '';
            document.getElementById('linkedin').value = data.linkedin || '';
            document.getElementById('objective').value = data.objective || '';
            document.getElementById('skills').value = data.skills || '';
            this.generatePreview();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new ResumeBuilder();
});
