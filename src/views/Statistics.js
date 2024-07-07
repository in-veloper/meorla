import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Table } from "reactstrap";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line } from "recharts";
import { useUser } from "contexts/UserContext";
import moment from "moment";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Statistics() {
    const { user } = useUser();  
    const [symptomData, setSymptomData] = useState([]);
    const [symptomCategorys, setSymptomCategorys] = useState("");
    const [workNodeData, setWorkNoteData] = useState([]);

    const fetchSymptomData = useCallback(async() => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/statistics/getSymptomData`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data) {
                setSymptomData(response.data);
            }
        }
    }, [user]);

    const fetchSymptomCategory = useCallback(async() => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/statistics/getSymptomCategory`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data) {
                setSymptomCategorys(response.data[0].symptom_categorys);
            }
        }
    }, [user]);

    const fetchWorkNoteData = useCallback(async() => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/workNote/getEntireWorkNote`,{
                params: {
                  userId: user.userId,
                  schoolCode: user.schoolCode
                }
            });
    
            if(response.data) {
                setWorkNoteData(response.data);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchSymptomData();
        fetchSymptomCategory();
        fetchWorkNoteData();
    }, [fetchSymptomData, fetchSymptomCategory, fetchWorkNoteData]);

    const dataLoaded = symptomData.length > 0 && symptomCategorys && workNodeData.length > 0;

    const symptomMapping = {};
    if(dataLoaded) {
        symptomCategorys.split("::").forEach(pair => {
            const [symptom, category] = pair.split(":");
            symptomMapping[symptom.trim()] = category.trim();
        });
    }

    const categoryCounts = {
        감염증: 0,
        구강치아계: 0,
        근골격계: 0,
        비뇨생식기계: 0,
        소화기계: 0,
        순환기계: 0,
        안과계: 0,
        이비인후과계: 0,
        정신신경계: 0,
        피부피하계: 0,
        호흡기계: 0,
        기타: 0
    };

    if(dataLoaded) {
        symptomData.forEach(row => {
            row.worknote_symptom.split("::").forEach(symptom => {
                const trimmedSymptom = symptom.trim();
                const category = symptomMapping[trimmedSymptom];
                if(category) {
                    if(categoryCounts[category] !== undefined) {
                        categoryCounts[category]++;
                    }else{
                        category['기타']++;
                    }
                }else{
                    categoryCounts['기타']++;
                }
            });
        });
    }

    const fullHourlyData = Array.from({ length: 10 }, (_, i) => ({
        hour: 9 + i,
        male: 0,
        female: 0
    }));

    if(dataLoaded) {
        workNodeData.forEach(({ updatedAt, sGender }) => {
            const visitHour = moment(updatedAt).hour();
            if(visitHour >= 9 && visitHour < 19) {
                const index = visitHour - 9;
                if(sGender === "남") {
                    fullHourlyData[index].male++;
                }else if(sGender === "여") {
                    fullHourlyData[index].female++;
                }
            }
        });
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label">{`${label}시간대 방문 학생`}</p>
                    <p className="intro" style={{ color: '#8884d8'}}>{`남학생: ${payload[0].value}`}</p>
                    <p className="intro" style={{ color: '#82ca9d'}}>{`여학생: ${payload[1].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const CustomVisitTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label">{`${label}`}</p>
                    <p className="intro" style={{ color: '#8884d8'}}>{`방문수 : ${payload[0].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const studentVisitCounts = {};

    if(dataLoaded) {
        workNodeData.forEach(({ sName }) => {
            if(studentVisitCounts[sName]) {
                studentVisitCounts[sName]++;
            }else{
                studentVisitCounts[sName] = 1;
            }
        });
    }

    const sortedStudentVisitData = Object.keys(studentVisitCounts)
        .map(name => ({
            name,
            visits: studentVisitCounts[name]
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);  // 상위 10명까지 획득

// BarChart--------------------------------------
    const data = [
        {
          name: 'Page A',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Page B',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          name: 'Page D',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
    ];
//---------------------------------------------------------

//PieChart-------------------------------------------------
    const pieData = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
    };
//---------------------------------------------------------

//ScatterChart---------------------------------------------

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
  ];
  const SCATTER_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];


//---------------------------------------------------------

//LineChart------------------------------------------------

const lineData = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
];

//---------------------------------------------------------
    return (
        <>
            <div className="content">
                <Row className="pl-3 pr-3" style={{ marginBottom: '-5px'}}>
                    <Table bordered className="stats-table text-center text-muted">
                        <thead>
                        <tr>
                            <th>감염증</th>
                            <th>구강치아계</th>
                            <th>근골격계</th>
                            <th>비뇨생식기계</th>
                            <th>소화기계</th>
                            <th>순환기계</th>
                            <th>안과계</th>
                            <th>이비인후과계</th>
                            <th>정신신경계</th>
                            <th>피부피하계</th>
                            <th>호흡기계</th>
                            <th>기타</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{categoryCounts.감염증}</td>
                            <td>{categoryCounts.구강치아계}</td>
                            <td>{categoryCounts.근골격계}</td>
                            <td>{categoryCounts.비뇨생식기계}</td>
                            <td>{categoryCounts.소화기계}</td>
                            <td>{categoryCounts.순환기계}</td>
                            <td>{categoryCounts.안과계}</td>
                            <td>{categoryCounts.이비인후과계}</td>
                            <td>{categoryCounts.정신신경계}</td>
                            <td>{categoryCounts.피부피하계}</td>
                            <td>{categoryCounts.호흡기계}</td>
                            <td>{categoryCounts.기타}</td>
                        </tr>
                        </tbody>
                    </Table>
                </Row>
                <Row className="d-flex no-gutters w-100">
                    <Col className="mr-2" style={{ width: '49%' }}>
                        <Card style={{ border: '1px solid lightgray' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                시간대별 남·여 학생 보건실 방문 수
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        width={500}
                                        height={300}
                                        data={fullHourlyData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" label={{ value: '시간', position: 'insideRight', offset: -30 }}/>
                                        <YAxis label={{ value: '인원 수', position: 'insideTopLeft', offset: -5 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="male" stackId="a" fill="#8884d8" />
                                        <Bar dataKey="female" stackId="a" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ width: '20%', padding: '10px', alignContent: 'center' }}>
                                    <div className="d-flex align-content-center mb-2">
                                        <span style={{ backgroundColor: '#8884d8', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 남학생
                                    </div>
                                    <div className="d-flex align-content-center">
                                        <span style={{ backgroundColor: '#82ca9d', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 여학생
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="ml-2" style={{ width: '49%' }}>
                        <Card style={{ border: '1px solid lightgray' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                학생별 보건실 방문 빈도 수
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        layout="vertical"
                                        width={500}
                                        height={300}
                                        data={sortedStudentVisitData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="visits" label={{ value: '빈도', position: 'insideRight', offset: -30 }}/>
                                        <YAxis type="category" dataKey="name" label={{ value: '학생 이름', position: 'insideTopLeft', offset: -5 }} interval={0} tickCount={10} />
                                        <Tooltip content={<CustomVisitTooltip />} />
                                        <Bar dataKey="visits">
                                            {sortedStudentVisitData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index < 5 ? '#EC5353' : '#ECD253'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ width: '20%', padding: '10px', alignContent: 'center' }}>
                                    <div className="d-flex align-content-center mb-2">
                                        <span style={{ backgroundColor: '#EC5353', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 상위 빈도 방문
                                    </div>
                                    <div className="d-flex align-content-center">
                                        <span style={{ backgroundColor: '#ECD253', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 하위 빈도 방문
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <ResponsiveContainer width={500} height={400}>
                            <ScatterChart
                                width={400}
                                height={400}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                                >
                                <CartesianGrid />
                                <XAxis type="number" dataKey="x" name="stature" unit="cm" />
                                <YAxis type="number" dataKey="y" name="weight" unit="kg" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="A school" data={scatterData} fill="#8884d8">
                                    {scatterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={SCATTER_COLORS[index % SCATTER_COLORS.length]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Col>
                    <Col md="6">
                        <ResponsiveContainer width={500} height={400}>
                            <LineChart
                                width={500}
                                height={300}
                                data={lineData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Statistics;