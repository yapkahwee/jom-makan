import Head from "next/head";
import React, { useState, useEffect } from "react";
import { db, getUserDetails } from "../lib/db";
import { useUser } from "../lib/auth/useUser";
import OrderCard from "../components/OrderCard";
import { isAfter, isToday } from "date-fns";
import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import NotFound from "../components/NotFound";
import OrderCardSkeleton from "../components/OrdeCardSkeleton";
import { useRouter } from "next/router";
import * as ga from "../lib/ga";

function useOrder(loading) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const unsubscribe = db
      .collection("orders")
      .orderBy("created_at", "asc")
      .onSnapshot(async (snapshot) => {
        let newOrder = snapshot.docs.map(async (doc) => {
          const orderData = doc.data();
          const { user } = await getUserDetails(orderData.created_by);
          orderData.created_by = user;
          return orderData;
        });
        await Promise.all(newOrder).then((newOrder) => {
          setOrders(newOrder);
        });
        loading(false);
      });
    return () => unsubscribe();
  }, []);
  const r = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes
    //and log those page views
    r.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      r.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [r.events]);
  useEffect(() => {
    ga.custompageview("Dashboard");
  }, []);
  return { orders };
}

const Order = () => {
  const [isLoading, setLoading] = useState(true);
  const { user, logout } = useUser();
  const { orders } = useOrder(setLoading);
  let todayOrderCount = 0;
  let upcomingOrderCount = 0;
  let yourOrderCount = 0;
  let yourJomCount = 0;

  //To overwrite the formatRelativeLocale method

  return (
    <div>
      <Head>
        <title>Order</title>
      </Head>
      {user ? (
        <Tabs isFitted isLazy>
          <TabList>
            <Tab>Today Orders</Tab>
            <Tab>Upcoming Orders</Tab>
            <Tab>Your Orders</Tab>
            <Tab>Your Joms</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {isLoading ? (
                <Flex flexWrap={"wrap"}>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </Flex>
              ) : (
                <>
                  <Flex flexWrap={"wrap"}>
                    {orders &&
                      orders.map((order, index) => {
                        if (
                          isToday(new Date(order.order_date)) &&
                          order.order_type === "1"
                        ) {
                          const yourOrder = order.created_by.id === user.id;
                          const yourJom = order.jom_members.includes(user.id);
                          todayOrderCount++;
                          return (
                            <OrderCard
                              key={index}
                              id={order.id}
                              creator_name={order.created_by.name}
                              creator_pic={order.created_by.profilePic}
                              res_name={order.res_name}
                              ref_url={order.ref_url}
                              order_date={order.order_date}
                              tips={order.tips}
                              description={order.description}
                              yourOrder={yourOrder}
                              yourJom={yourJom}
                              jom_members={order.jom_members}
                              order_type={order.order_type}
                              tags={order.tags}
                            />
                          );
                        }
                      })}
                    {todayOrderCount === 0 ? <NotFound obj="Orders" /> : null}
                  </Flex>
                </>
              )}
            </TabPanel>
            {/* upcoming orders */}
            <TabPanel>
              {isLoading ? (
                <h2>Loading...</h2>
              ) : (
                <>
                  <Flex flexWrap={"wrap"}>
                    {orders &&
                      orders.map((order, index) => {
                        if (
                          isAfter(new Date(order.order_date), new Date()) &&
                          !isToday(new Date(order.order_date)) &&
                          order.order_type === "1"
                        ) {
                          const yourOrder = order.created_by.id === user.id;
                          const yourJom = order.jom_members.includes(user.id);
                          upcomingOrderCount++;
                          return (
                            <OrderCard
                              key={index}
                              id={order.id}
                              creator_name={order.created_by.name}
                              creator_pic={order.created_by.profilePic}
                              res_name={order.res_name}
                              ref_url={order.ref_url}
                              order_date={order.order_date}
                              tips={order.tips}
                              description={order.description}
                              yourOrder={yourOrder}
                              yourJom={yourJom}
                              jom_members={order.jom_members}
                              order_type={order.order_type}
                              tags={order.tags}
                            />
                          );
                        }
                      })}
                    {upcomingOrderCount === 0 ? (
                      <NotFound obj="Orders" />
                    ) : null}
                  </Flex>
                </>
              )}
            </TabPanel>
            <TabPanel>
              {isLoading ? (
                <Flex flexWrap={"wrap"}>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </Flex>
              ) : (
                <>
                  <Flex flexWrap={"wrap"}>
                    {orders &&
                      orders.map((order, index) => {
                        if (order.created_by.id === user.id) {
                          const yourOrder = order.created_by.id === user.id;
                          const yourJom = order.jom_members.includes(user.id);
                          yourOrderCount++;
                          return (
                            <OrderCard
                              key={index}
                              id={order.id}
                              creator_name={order.created_by.name}
                              creator_pic={order.created_by.profilePic}
                              res_name={order.res_name}
                              ref_url={order.ref_url}
                              order_date={order.order_date}
                              tips={order.tips}
                              description={order.description}
                              yourOrder={true}
                              yourJom={false}
                              jom_members={order.jom_members}
                              order_type={order.order_type}
                              tags={order.tags}
                            />
                          );
                        }
                      })}
                    {yourOrderCount === 0 ? <NotFound obj="Orders" /> : null}
                  </Flex>
                </>
              )}
            </TabPanel>
            <TabPanel>
              {isLoading ? (
                <Flex flexWrap={"wrap"}>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </Flex>
              ) : (
                <>
                  <Flex flexWrap={"wrap"}>
                    {orders &&
                      orders.map((order, index) => {
                        if (order.jom_members.includes(user.id)) {
                          yourJomCount++;
                          return (
                            <OrderCard
                              key={index}
                              id={order.id}
                              creator_name={order.created_by.name}
                              creator_pic={order.created_by.profilePic}
                              res_name={order.res_name}
                              ref_url={order.ref_url}
                              order_date={order.order_date}
                              tips={order.tips}
                              description={order.description}
                              yourOrder={false}
                              yourJom={true}
                              jom_members={order.jom_members}
                              order_type={order.order_type}
                              tags={order.tags}
                            />
                          );
                        }
                      })}
                    {yourJomCount === 0 ? <NotFound obj="Joms" /> : null}
                  </Flex>
                </>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        ""
      )}
    </div>
  );
};

export default Order;
