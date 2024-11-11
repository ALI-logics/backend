import { generateToken } from "../utils/jsonwebtoken.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const name1=req.body?.name;
    console.log(name1)
    if (!name || !email || !password) {
      return res.json({ message: "Invalid User data" });
    }
    const isExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isExist) {
      return res.json({
        message: "User is already registered with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("New user ID:", newUser.id);

    const jsonwebtoken = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7 days",
      }
    );

    res.json({ message: "User registered", token: jsonwebtoken });
  } catch (err) {
    console.log("error", err);
    res.json({ message: "Error occured" });
  }
};

const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ message: "Invalid User data" });
    }
    const isExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isExist) {
      return res.json({
        message: "User is already registered with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log('password', password)
    // console.log('hashedPassword', hashedPassword)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log("New user ID:", newUser.id);

    const jsonwebtoken = generateToken({ id: newUser.id });

    res.json({ message: "User registered", token: jsonwebtoken });
  } catch (err) {
    console.log("error", err);
    res.json({ message: "Error occured" });
  }
};

const protectedRoute = (req, res) => {
  console.log("user from middleware", req.user);
  res.send("Hello you are logged in");
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send("Invalid User data");
    }
    const isExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!isExist) {
      return res.send("email does not exist");
    }
    console.log("user found", isExist);
    const isValid = await bcrypt.compare(password, isExist.password);
    if (!isValid) {
      return res.send("incorrect password");
    }

    const jsonwebtoken = generateToken({ id: isValid.id });

    return res.json({ message: "logged in successfully", token: jsonwebtoken });
  } catch (err) {
    console.log("error", err);
    return res.json({ err: err?.message });
  }
};
export { register, login, adminRegister, protectedRoute };
