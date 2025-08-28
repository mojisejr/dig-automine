### Product Requirements Document (PRD) - AutoMine

---

### **ภาพรวมโปรเจกต์**

**ชื่อโปรเจกต์**: AutoMine

**คำอธิบายโปรเจกต์**: AutoMine คือแพลตฟอร์มบริการบนเว็บไซต์ที่ช่วยให้ผู้ใช้งานสามารถ **“ฝาก” NFT DigDragon** ของตนเองไว้ในระบบ เพื่อให้ระบบทำการจัดการการ **Stake NFT โดยอัตโนมัติ** โดยระบบจะทำการ Unstake NFT ออกจากเหมืองเก่าและ Stake เข้าไปในเหมืองใหม่ให้โดยอัตโนมัติเมื่อถึงเวลาที่กำหนด โมเดลการชำระเงินจะถูกปรับเปลี่ยนเป็นแบบหักเปอร์เซ็นต์จากรางวัลที่ผู้ใช้ได้รับ

**เป้าหมายของโปรเจกต์**:

- สร้างระบบที่ช่วยให้ผู้ใช้งานประหยัดเวลาและลดความยุ่งยากในการเปลี่ยนเหมืองด้วยตนเอง
- สร้างรายได้ที่ยั่งยืนผ่านการเก็บค่าธรรมเนียมจากรางวัลที่ผู้ใช้ได้รับ
- สร้างระบบที่มีความน่าเชื่อถือ โปร่งใส ปลอดภัย และบำรุงรักษาง่าย

---

### **สถาปัตยกรรมและเทคโนโลยี**

**Core Structure**

- **Smart Contracts**: สัญญาอัจฉริยะที่ทำหน้าที่เป็นตรรกะหลักของระบบ จะถูกเขียนและทดสอบด้วย Hardhat
- **Frontend**: ส่วนติดต่อผู้ใช้งานและผู้ดูแลระบบ
- **Backend & Bot**: ส่วนการทำงานอัตโนมัติที่อยู่นอกบล็อกเชน

**Tech Stack (ฉบับสมบูรณ์)**

- **Package Manager**: pnpm (สำหรับ Monorepo)
- **Smart Contract**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: Next.js (TypeScript), wagmi, Viem, shadcn-ui, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Next.js API Routes, Prisma (สำหรับ PostgreSQL)
- **Automated Bot**: Node.js, AWS Lambda (สำหรับ Serverless Execution), AWS Secrets Manager (สำหรับจัดการ Private Key)
- **Database**: PostgreSQL
- **Testing**: Hardhat (สำหรับ Smart Contract), Playwright MCP (สำหรับ Frontend)
- **Deployment**: Render (สำหรับ Frontend), AWS Lambda (สำหรับ Bot), Hardhat (สำหรับ Smart Contract บน Bitkub Chain)

---

### **Smart Contract Design: `AutoMine` Contract**

ระบบจะใช้สัญญาอัจฉริยะ **`AutoMine` ตัวเดียว** เพื่อรวบรวมฟังก์ชันการทำงานหลักทั้งหมดสำหรับความง่ายในการบำรุงรักษา

**ฟังก์ชันสำหรับผู้ใช้ (User Functions)**

- `deposit(uint256[] calldata _tokenIds)`: ฝาก NFT เข้าสู่สัญญา โดยผู้ใช้ต้อง Approve สัญญาก่อน
- `claimReward()`: คำนวณรางวัลที่ได้รับ, **หักค่าธรรมเนียมเป็นเปอร์เซ็นต์**, และโอนรางวัลส่วนที่เหลือเข้ากระเป๋าผู้ใช้ทันที
- `withdrawAllNFT()`: Unstake NFT ทั้งหมดที่ฝากไว้ และโอนกลับไปยังกระเป๋าของผู้ใช้

**ฟังก์ชันสำหรับ Bot (Bot Functions)**

- `switchMine(address _targetMine)`: ถูกเรียกใช้โดย Bot เพื่อสั่ง Unstake NFT จากเหมืองเก่าและ Stake เข้าไปยังเหมืองใหม่

**ฟังก์ชันสำหรับผู้ดูแลระบบ (Admin Functions)**

- `emergencyUnstake(address _user, uint256[] calldata _tokenIds)`: Unstake NFT ของผู้ใช้ในกรณีฉุกเฉิน
- `setMine(address _current, address _target)`: กำหนด Address ของเหมืองปัจจุบันและเหมืองเป้าหมาย
- `setFeePercentage(uint256 _newFee)`: กำหนดเปอร์เซ็นต์ค่าธรรมเนียมที่ระบบจะหัก
- `setDigDragonContract(address _nftAddress)`: ตั้งค่า Address ของสัญญา NFT

---

### **ฟีเจอร์หลักของระบบ**

**User Journey (ฟีเจอร์สำหรับผู้ใช้งาน)**

- **การเชื่อมต่อ Wallet**: สามารถเชื่อมต่อ **Metamask** เพื่อเข้าสู่ระบบได้เท่านั้น
- **การฝาก NFT**: สามารถฝาก NFT DigDragon เข้าสู่ระบบเพื่อให้ระบบจัดการการ Stake โดยอัตโนมัติ
- **Dashboard สำหรับผู้ใช้**: แสดงข้อมูลแบบเรียลไทม์ เช่น NFT ที่ฝากไว้, Hash Power รวม, เหมืองที่ NFT กำลัง Stake อยู่, เวลานับถอยหลัง และรางวัลที่คาดว่าจะได้รับในเดือนนี้
- **การรับรางวัล (Claim Reward)**: เมื่อผู้ใช้เรียกรับรางวัล ระบบจะทำการคำนวณและหักค่าธรรมเนียมเป็นเปอร์เซ็นต์ตามที่กำหนด และโอนรางวัลส่วนที่เหลือเข้ากระเป๋าผู้ใช้ทันที
- **การยกเลิกบริการ**: ผู้ใช้สามารถ Unstake NFT ทั้งหมดและถอนออกจากระบบได้ทุกเมื่อ

**Admin Journey (ฟีเจอร์สำหรับผู้ดูแลระบบ)**

- **Admin Dashboard**: หน้าสำหรับจัดการข้อมูล
- **การจัดการผู้ใช้**: ดูข้อมูลผู้ใช้และสถานะของแพ็คเกจ
- **การจัดการเหมือง**: สามารถเพิ่มข้อมูลเหมืองใหม่ (Address, เวลาเปิด/ปิด)
- **การตรวจสอบระบบ**: ดู **Action Log** ที่แยกตามประเภท (User, Bot, Admin)
- **Unstake ฉุกเฉิน**: สามารถบังคับ Unstake NFT ของผู้ใช้รายใดรายหนึ่งได้ในกรณีฉุกเฉิน

---

### **UI Theme and Rules**

ส่วนนี้จะกำหนดแนวทางและหลักเกณฑ์สำหรับการออกแบบ User Interface ของ AutoMine โดยใช้มาตรฐานสี **oklch** เพื่อให้ทุกองค์ประกอบมีความสอดคล้องและเป็นไปในทิศทางเดียวกัน

**แนวทางสี oklch (Oklch Standard)**
เราจะใช้มาตรฐานสี **oklch** ในการกำหนดค่าสีทั้งหมดของโปรเจกต์ ซึ่งจะช่วยให้การจัดการสีมีความสม่ำเสมอและมีความเข้ากันได้บนเบราว์เซอร์ที่รองรับได้ดียิ่งขึ้น

**1. Brand Identity and Color Palette**
ธีมหลักของ UI จะใช้ชื่อ **“silk”** โดยเน้นความรู้สึกหรูหรา สงบ และทันสมัย เพื่อให้ประสบการณ์ใช้งานที่น่าเชื่อถือ

- **Primary Color**: `oklch(79% 0.184 86.047)` - ใช้สำหรับองค์ประกอบหลัก
- **Primary Content**: `oklch(98% 0.026 102.212)`
- **Secondary Color**: `oklch(76% 0.188 70.08)` - ใช้สำหรับองค์ประกอบรอง
- **Secondary Content**: `oklch(98% 0.022 95.277)`
- **Accent Color**: `oklch(76% 0.188 70.08)` - ใช้สำหรับเน้นส่วนสำคัญ
- **Accent Content**: `oklch(98% 0.022 95.277)`
- **Neutral Color**: `oklch(44% 0.119 151.328)`
- **Neutral Content**: `oklch(98% 0.018 155.826)`
- **Base Colors (Backgrounds)**:
  - `--color-base-100`: `oklch(26% 0.065 152.934)` (สีพื้นหลังหลัก)
  - `--color-base-200`: `oklch(39% 0.095 152.535)` (สีพื้นหลังรอง)
  - `--color-base-300`: `oklch(44% 0.119 151.328)` (สีสำหรับขอบเขต)
- **Content Color**: `oklch(96% 0.044 156.743)` (สีสำหรับข้อความ)

**2. UI Component Rules**

- **Typography**: ใช้ชุดฟอนต์ที่อ่านง่ายและเข้ากับธีม **"silk"**
- **Radius and Borders**:
  - `--radius-field`: `1rem` (สำหรับ input field)
  - `--radius-box`: `0.25rem` (สำหรับ box และ card)
- **Spacing**: กำหนดระยะห่างมาตรฐานระหว่างองค์ประกอบต่าง ๆ

**3. Interaction and Feedback**

- **States**: กำหนดสถานะขององค์ประกอบต่าง ๆ (Default, Hover, Active, Disabled)
- **System Messages**: ใช้สีที่กำหนดไว้สำหรับข้อความแจ้งเตือน
  - **Success**: `oklch(79% 0.209 151.711)`
  - **Warning**: `oklch(85% 0.199 91.936)`
  - **Error**: `oklch(71% 0.194 13.428)`

---

### **แนวทางการพัฒนา**

เพื่อให้โปรเจกต์ดำเนินการได้อย่างราบรื่น จะต้องยึดหลักการพัฒนาที่กำหนดไว้ดังนี้:

- **Solo Developer Approach**: ใช้โค้ดที่เรียบง่าย, อ่านง่าย, และบำรุงรักษาง่าย
- **Keep it Simple, Start Small**: ให้เริ่มต้นด้วยวิธีการและแพทเทิร์นที่ง่ายที่สุดก่อน
- **Controlled Scope**: ควบคุมขอบเขตของโปรเจกต์อย่างเคร่งครัด
- **Keep Best Practices in Mind**:
  - **Smart Contract**: ใช้ **Hardhat** ในการเขียน Test Script
  - **Frontend**: ใช้ **Playwright** เพื่อทำ End-to-End Testing
- **Critical Security in Smart Contract Development**:
  - **ตรวจสอบ Reentrancy**: ใช้ `ReentrancyGuard`
  - **การจัดการสิทธิ์**: ใช้ `onlyOwner` หรือ `AccessControl`
  - **การจัดการ Integer Overflow/Underflow**: ใช้ไลบรารี SafeMath
  - **การล็อก (Events)**: ทุกการกระทำที่สำคัญ ต้องมีการปล่อย Event
- **Workflow การพัฒนา**:
  1.  **Dev Contract**
  2.  **Test Contract**
  3.  **Dev Bot**
  4.  **Test Bot with Contract**
  5.  **Dev UI**
  6.  **Test UI with Bot and Contract**
- **การบันทึก (Logging)**: ใช้คำนำหน้า `debug`, `info`, และ `error`
